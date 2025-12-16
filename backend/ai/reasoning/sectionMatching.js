import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRAGContext } from "../retrieval/retrievalCore.js";
import { parseJSONSafely } from "./jsonUtils.js";

export async function analyzeSectionMatching(
  projectId,
  section1Query,
  section2Query,
  options = {}
) {
  try {
    const safeOptions =
      options && typeof options === "object" ? options : {};
    const {
      nContextChunks = 15,
      model = "gpt-4o",
      section1Name = "Section 1",
      section2Name = "Section 2",
    } = safeOptions;

    const section1Chunks = await getRAGContext(
      projectId,
      section1Query,
      nContextChunks
    );
    const section2Chunks = await getRAGContext(
      projectId,
      section2Query,
      nContextChunks
    );

    if (section1Chunks.length === 0 || section2Chunks.length === 0) {
      throw new Error(
        "Insufficient context found for one or both sections. Please ensure the document contains relevant content."
      );
    }

    const section1Context = section1Chunks
      .map(
        (chunk, idx) =>
          `[${section1Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(
            chunk.metadata
          )}]`
      )
      .join("\n\n");

    const section2Context = section2Chunks
      .map(
        (chunk, idx) =>
          `[${section2Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(
            chunk.metadata
          )}]`
      )
      .join("\n\n");

    const llm = createChatModel({
      model,
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(
      `You are an expert requirements analyst specializing in comparing and matching document sections. Your task is to analyze the relationship and matching between two sections from a Software Requirements Specification (SRS) document.

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

Generate comprehensive matching analysis:`
    );

    const formattedPrompt = await prompt.format({
      section1Name,
      section2Name,
      section1Context,
      section2Context,
    });

    console.log(
      `Analyzing section matching: ${section1Name} vs ${section2Name}`
    );
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);

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