/**
 * Analysis Module - Handles test cases, bug analysis, and section matching
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRAGContext, getComprehensiveRAGContext } from "./retrieval.js";
import { parseJSONSafely } from "./utils.js";
import { createTestCasePromptByFeatureType } from "./prompts.js";

/**
 * Gets context from specific SRS sections
 */
async function getContextFromSections(projectId, sectionNumbers, nChunksPerSection = 3) {
  if (!sectionNumbers || sectionNumbers.length === 0) {
    return [];
  }

  const allChunks = [];
  for (const sectionNum of sectionNumbers) {
    try {
      // Search for content related to this section
      const query = `section ${sectionNum} requirements specifications`;
      const chunks = await getRAGContext(projectId, query, nChunksPerSection);
      allChunks.push(...chunks.map(chunk => ({
        ...chunk,
        sourceSection: sectionNum
      })));
    } catch (error) {
      console.warn(`Could not retrieve context for section ${sectionNum}:`, error.message);
    }
  }
  return allChunks;
}

/**
 * Generates test cases from RAG with feature-aware generation
 */
export async function generateTestCasesFromRAG(
  projectId,
  featureDescription,
  options = {}
) {
  try {
    const safeOptions = options && typeof options === 'object' ? options : {};
    const { 
      nContextChunks = 5, 
      model = "gpt-4o-mini",
      featureType = "FUNCTIONAL",
      matchedSections = [],
      useComprehensiveRetrieval = false
    } = safeOptions;

    // Get context - prioritize matched sections if available
    let contextChunks = [];
    let sectionContext = "";

    if (matchedSections && matchedSections.length > 0) {
      // Get context from specific sections mentioned in feature
      const sectionChunks = await getContextFromSections(projectId, matchedSections, 3);
      contextChunks.push(...sectionChunks);
      
      sectionContext = `\n**Feature is from SRS Sections:** ${matchedSections.join(", ")}\nUse the exact specifications from these sections when building test cases.`;
    }

    // Get general context
    if (useComprehensiveRetrieval) {
      const comprehensiveResult = await getComprehensiveRAGContext(projectId, 2);
      contextChunks.push(...comprehensiveResult.chunks);
    } else {
      const generalChunks = await getRAGContext(
        projectId,
        featureDescription,
        nContextChunks
      );
      contextChunks.push(...generalChunks);
    }

    // Remove duplicates
    const uniqueChunks = [];
    const seenTexts = new Set();
    for (const chunk of contextChunks) {
      const textHash = chunk.text.substring(0, 100).toLowerCase();
      if (!seenTexts.has(textHash)) {
        seenTexts.add(textHash);
        uniqueChunks.push(chunk);
      }
    }

    const context = uniqueChunks.map((chunk) => {
      const sectionInfo = chunk.sourceSection ? `[From Section ${chunk.sourceSection}]` : "";
      return `${sectionInfo}\n${chunk.text}`;
    }).join("\n\n");

    // Configure LLM with JSON response format if supported
    // Use modelKwargs for response_format in LangChain
    const llmConfig = {
      model: model,
      temperature: 0.3, // Lower temperature for more consistent JSON output
      apiKey: process.env.OPENAI_API_KEY,
    };
    
    // Add response_format for JSON mode if using OpenAI models that support it
    // (gpt-4o, gpt-4-turbo, gpt-3.5-turbo support JSON mode)
    if (model.includes('gpt-4') || model.includes('gpt-3.5-turbo') || model.includes('gpt-4o')) {
      llmConfig.modelKwargs = {
        response_format: { type: "json_object" }
      };
    }
    
    const llm = new ChatOpenAI(llmConfig);

    // Get feature-type-specific guidance
    const featureTypeGuidance = createTestCasePromptByFeatureType(featureType, matchedSections);

    const prompt = PromptTemplate.fromTemplate(`You are an expert QA engineer. Based on the following feature description and project requirements context, generate comprehensive test cases.

**FEATURE TYPE:** {featureType}
{featureTypeGuidance}

**TEST CASE GENERATION RULES:**
1. Build test cases based on the feature type and SRS specifications
2. For FUNCTIONAL features: Create functional test cases (Happy Path, Negative, Alternative Paths)
3. For DATA features: Create data validation test cases (Field validation, Boundary tests, Data integrity)
4. For WORKFLOW features: Create end-to-end workflow test cases following exact steps from SRS
5. For QUALITY features: Create non-functional test cases (Performance, Security, Usability, Availability)
6. For INTERFACE features: Create interface test cases (UI, API, Hardware interfaces)
7. For REPORT features: Create report generation and content test cases
8. For CONSTRAINT features: Create business rule and compliance test cases
9. For NOTIFICATION features: Create notification delivery and content test cases

**TEST CASE STRUCTURE:**
For each test case, provide:
- testCaseId: unique identifier (format: TC_XXX)
- title: clear test case title describing what is being tested
- description: detailed description of the test scenario
- steps: array of test step strings (be specific and follow SRS steps if available)
- expectedResult: expected outcome based on SRS specifications
- priority: high, medium, or low (based on feature priority and test importance)
- status: "pending"
- preconditions: array of prerequisite conditions (e.g., user logged in, data exists)
- testData: object with test data requirements (optional)

**CRITICAL JSON FORMAT REQUIREMENTS:**
You MUST return a valid JSON object with a "testCases" array property containing all test cases.

**REQUIRED OUTPUT FORMAT:**
{{
  "testCases": [
    {{
      "testCaseId": "TC_001",
      "title": "Test Case Title",
      "description": "Test description",
      "steps": ["Step 1", "Step 2"],
      "expectedResult": "Expected result",
      "priority": "high",
      "status": "pending",
      "preconditions": ["Precondition 1"]
    }}
  ]
}}

**JSON RULES:**
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- The root must be a JSON object with a "testCases" array property
- Every string value MUST be properly escaped
- No trailing commas
- All property names and string values must be in double quotes
- No comments in JSON
- Ensure all brackets and braces are properly closed

**IMPORTANT:** 
- Generate multiple test cases covering different scenarios (Happy Path, Negative, Boundary, etc.)
- Reference specific SRS sections when available
- Use exact terminology and values from SRS
- Ensure JSON is valid and parseable

**Feature Description:**
{featureDescription}
{sectionContext}

**Project Requirements Context:**
{context}

**FINAL INSTRUCTIONS:**
1. Generate 5-10 comprehensive test cases covering different scenarios
2. Return ONLY a valid JSON object with "testCases" array - no other text
3. Ensure all JSON is properly formatted and valid
4. Double-check for: proper quotes, no trailing commas, closed brackets

Generate comprehensive test cases now. Return ONLY the JSON object:`);

    const formattedPrompt = await prompt.format({
      featureDescription,
      context,
      featureType,
      featureTypeGuidance,
      sectionContext,
    });
    
    // Try generating with retries
    let content = null;
    let parsed = null;
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying test case generation (attempt ${attempt + 1}/${maxRetries + 1})...`);
          // Add retry instruction to prompt
          const retryPrompt = formattedPrompt + "\n\n**RETRY INSTRUCTION:** Please ensure the JSON is valid and properly formatted. Check for: trailing commas, unescaped quotes, unclosed brackets.";
          const result = await llm.invoke(retryPrompt);
          content = result.content;
        } else {
          const result = await llm.invoke(formattedPrompt);
          content = result.content;
        }
        
        parsed = parseJSONSafely(content, 1);
        break; // Success, exit retry loop
      } catch (error) {
        if (attempt === maxRetries) {
          // Last attempt failed
          console.error(`Failed to generate valid JSON after ${maxRetries + 1} attempts`);
          console.error("Last response preview:", content?.substring(0, 500) || "No content");
          throw error;
        }
        // Continue to next retry
        console.warn(`JSON parsing failed on attempt ${attempt + 1}, retrying...`);
      }
    }

    if (!parsed) {
      throw new Error("Failed to parse JSON response after retries");
    }

    // Handle both array and object formats
    let testCases = [];
    if (Array.isArray(parsed)) {
      testCases = parsed;
    } else if (parsed.testCases && Array.isArray(parsed.testCases)) {
      testCases = parsed.testCases;
    } else if (typeof parsed === 'object') {
      // Try to find any array property
      const arrayKeys = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
      if (arrayKeys.length > 0) {
        testCases = parsed[arrayKeys[0]];
      }
    }
    
    if (!Array.isArray(testCases) || testCases.length === 0) {
      console.warn("No test cases generated or invalid format");
      return [];
    }

    // Validate and enhance test cases with metadata
    const enhancedTestCases = testCases
      .filter(tc => tc && typeof tc === 'object') // Filter out invalid entries
      .map((tc, index) => {
        // Ensure all required fields exist
        if (!tc.title) {
          console.warn(`Test case at index ${index} missing title, skipping`);
          return null;
        }
        
        return {
          title: String(tc.title || `Test Case ${index + 1}`),
          description: String(tc.description || ''),
          steps: Array.isArray(tc.steps) ? tc.steps.map(s => String(s)) : [],
          expectedResult: String(tc.expectedResult || ''),
          priority: ['high', 'medium', 'low'].includes(tc.priority?.toLowerCase()) 
            ? tc.priority.toLowerCase() 
            : 'medium',
          status: 'pending',
          preconditions: Array.isArray(tc.preconditions) ? tc.preconditions.map(p => String(p)) : [],
          testCaseId: tc.testCaseId || `TC_${String(index + 1).padStart(3, '0')}`,
          testData: tc.testData || {},
        };
      })
      .filter(tc => tc !== null); // Remove null entries
    
    console.log(`Successfully generated ${enhancedTestCases.length} test cases for feature type: ${featureType}`);
    
    return enhancedTestCases;
  } catch (error) {
    console.error("Error generating test cases from RAG:", error);
    throw error;
  }
}

/**
 * Analyzes matching between different document sections
 */
export async function analyzeSectionMatching(
  projectId,
  section1Query,
  section2Query,
  options = {}
) {
  try {
    const safeOptions = options && typeof options === 'object' ? options : {};
    const { 
      nContextChunks = 15, 
      model = "gpt-4o",
      section1Name = "Section 1",
      section2Name = "Section 2"
    } = safeOptions;

    // Get context chunks for both sections
    const section1Chunks = await getRAGContext(projectId, section1Query, nContextChunks);
    const section2Chunks = await getRAGContext(projectId, section2Query, nContextChunks);

    if (section1Chunks.length === 0 || section2Chunks.length === 0) {
      throw new Error("Insufficient context found for one or both sections. Please ensure the document contains relevant content.");
    }

    // Combine contexts with clear section markers
    const section1Context = section1Chunks.map((chunk, idx) => 
      `[${section1Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(chunk.metadata)}]`
    ).join("\n\n");

    const section2Context = section2Chunks.map((chunk, idx) => 
      `[${section2Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(chunk.metadata)}]`
    ).join("\n\n");

    const llm = new ChatOpenAI({
      model: model,
      temperature: 0.3, // Lower temperature for more consistent, accurate analysis
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(`You are an expert requirements analyst specializing in comparing and matching document sections. Your task is to analyze the relationship and matching between two sections from a Software Requirements Specification (SRS) document.

**CRITICAL INSTRUCTIONS:**
1. **Extract Section References**: Identify ALL section numbers/IDs mentioned in each context (e.g., "4.2.1", "3.1.2", "JDECo-SMS-R1")
2. **Map Relationships**: Create explicit mappings between related elements from both sections
3. **Functional Matching**: Analyze functional compatibility, not just textual similarity
4. **Section Linking**: For each matched element, provide the EXACT section reference from the document
5. **Gap Analysis**: Identify missing elements, inconsistencies, and areas needing improvement
6. **Be Precise**: Use exact terminology and section numbers from the provided context

**Analysis Structure:**

For each comparison point, analyze:
- **Element Name**: What is being compared (e.g., "Purpose", "Content", "Users", "Priority")
- **Section 1 Value**: Exact value from {section1Name} with section reference (e.g., "4.2.1: Report generation")
- **Section 2 Value**: Exact value from {section2Name} with section reference (e.g., "3.1.2: Notification system")
- **Match Type**: One of: "exact_match", "complementary", "partial_match", "mismatch", "missing"
- **Match Score**: Numerical score 0-100 indicating match quality
- **Section References**: Array of exact section numbers/IDs from the document that support this match
- **Reasoning**: Detailed explanation of why this match exists or doesn't exist

**Output Format:**
Return a JSON object with the following structure:
{{
  "directAnswer": "Yes/No - Brief answer about matching",
  "overallMatchScore": 0-100,
  "functionalMatch": {{
    "score": 0-100,
    "analysis": "Detailed analysis",
    "matchedElements": [
      {{
        "element": "element name",
        "section1Value": "value with section ref",
        "section2Value": "value with section ref",
        "matchType": "match type",
        "matchScore": 0-100,
        "sectionReferences": ["4.2.1", "3.1.2"],
        "reasoning": "explanation"
      }}
    ]
  }},
  "strengths": [
    {{
      "title": "Strength title",
      "description": "Detailed description",
      "sectionReferences": ["4.2.1", "3.1.2"],
      "impact": "high/medium/low"
    }}
  ],
  "improvements": [
    {{
      "title": "Improvement title",
      "issue": "What's the problem",
      "currentState": "Current state with section refs",
      "recommendedSolution": "What should be done",
      "sectionReferences": ["4.2.1"],
      "priority": "high/medium/low"
    }}
  ],
  "finalEvaluation": {{
    "matchPercentage": 0-100,
    "criteria": [
      {{
        "criterion": "Criterion name",
        "percentage": 0-100,
        "evaluation": "excellent/good/needs_improvement"
      }}
    ]
  }},
  "conclusion": {{
    "summary": "Overall summary",
    "recommendation": "Final recommendation",
    "status": "match_with_improvements/match/no_match"
  }},
  "integrationPlan": {{
    "description": "How sections should integrate",
    "flow": ["step 1", "step 2"],
    "sectionReferences": ["4.2.1", "3.1.2"]
  }}
}}

**IMPORTANT:**
- Return ONLY valid JSON, no markdown code blocks, no explanations outside JSON
- Use EXACT section numbers/IDs from the provided context
- Be specific and detailed in all analyses
- Every matched element MUST include section references
- Start with {{ and end with }}

**{section1Name} Context:**
{section1Context}

**{section2Name} Context:**
{section2Context}

**Analysis Request:**
Analyze the matching and relationship between {section1Name} and {section2Name}. Focus on functional compatibility, section references, and provide actionable recommendations.

Generate comprehensive matching analysis:`);

    const formattedPrompt = await prompt.format({
      section1Name,
      section2Name,
      section1Context,
      section2Context,
    });

    console.log(`Analyzing section matching: ${section1Name} vs ${section2Name}`);
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);

    // Enhance result with metadata
    return {
      ...parsed,
      metadata: {
        section1Query,
        section2Query,
        section1ChunksCount: section1Chunks.length,
        section2ChunksCount: section2Chunks.length,
        model,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error analyzing section matching:", error);
    throw error;
  }
}

