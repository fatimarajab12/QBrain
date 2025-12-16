import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  getRAGContext,
  getComprehensiveRAGContext,
} from "../retrieval/retrievalCore.js";
import { dedupeByKey, invokeJSONPrompt } from "./jsonUtils.js";
import { createTestCasePromptByFeatureType } from "./prompts/index.js";

async function getContextFromSections(
  projectId,
  sectionNumbers,
  nChunksPerSection = 3
) {
  if (!sectionNumbers || sectionNumbers.length === 0) {
    return [];
  }

  const allChunks = [];
  for (const sectionNum of sectionNumbers) {
    try {
      const query = `section ${sectionNum} requirements specifications`;
      const chunks = await getRAGContext(projectId, query, nChunksPerSection);
      allChunks.push(
        ...chunks.map((chunk) => ({
          ...chunk,
          sourceSection: sectionNum,
        }))
      );
    } catch (error) {
      console.warn(
        `Could not retrieve context for section ${sectionNum}:`,
        error.message
      );
    }
  }
  return allChunks;
}

function normalizeTestCaseKey(tc) {
  if (!tc || typeof tc !== "object") return "";
  const title = (tc.title || "").toString().trim().toLowerCase();
  const desc = (tc.description || "").toString().trim().toLowerCase();
  const expected = (tc.expectedResult || "")
    .toString()
    .trim()
    .toLowerCase();
  return `${title}|||${desc}|||${expected}`;
}

export async function generateTestCasesFromRAG(
  projectId,
  featureDescription,
  options = {}
) {
  try {
    const safeOptions =
      options && typeof options === "object" ? options : {};
    const {
      nContextChunks = 5,
      model = "gpt-4o-mini",
      featureType = "FUNCTIONAL",
      matchedSections = [],
      useComprehensiveRetrieval = false,
    } = safeOptions;

    let contextChunks = [];
    let sectionContext = "";

    if (matchedSections && matchedSections.length > 0) {
      const sectionChunks = await getContextFromSections(
        projectId,
        matchedSections,
        3
      );
      contextChunks.push(...sectionChunks);

      sectionContext = `\n**Feature is from SRS Sections:** ${matchedSections.join(
        ", "
      )}\nUse the exact specifications from these sections when building test cases.`;
    }

    if (useComprehensiveRetrieval) {
      const comprehensiveResult = await getComprehensiveRAGContext(
        projectId,
        2
      );
      contextChunks.push(...comprehensiveResult.chunks);
    } else {
      const generalChunks = await getRAGContext(
        projectId,
        featureDescription,
        nContextChunks
      );
      contextChunks.push(...generalChunks);
    }

    const uniqueChunks = [];
    const seenTexts = new Set();
    for (const chunk of contextChunks) {
      const textHash = chunk.text.substring(0, 100).toLowerCase();
      if (!seenTexts.has(textHash)) {
        seenTexts.add(textHash);
        uniqueChunks.push(chunk);
      }
    }

    const context = uniqueChunks
      .map((chunk) => {
        const sectionInfo = chunk.sourceSection
          ? `[From Section ${chunk.sourceSection}]`
          : "";
        return `${sectionInfo}\n${chunk.text}`;
      })
      .join("\n\n");

    const llmConfig = {
      model: model,
      temperature: 0.3,
      apiKey: process.env.OPENAI_API_KEY,
    };

    if (
      model.includes("gpt-4") ||
      model.includes("gpt-3.5-turbo") ||
      model.includes("gpt-4o")
    ) {
      llmConfig.modelKwargs = {
        response_format: { type: "json_object" },
      };
    }

    const llm = createChatModel(llmConfig);

    const featureTypeGuidance = createTestCasePromptByFeatureType(
      featureType,
      matchedSections
    );

    const prompt = PromptTemplate.fromTemplate(
      `You are an expert QA engineer. Based on the following feature description and project requirements context, generate comprehensive test cases.

**FEATURE TYPE:** {featureType}
{featureTypeGuidance}

**TEST CASE GENERATION RULES:**
1. Build test cases based on the feature type and SRS specifications.
2. Cover DIFFERENT scenario types (no duplicates):
   - At least one Happy Path scenario.
   - At least one Negative scenario (invalid data / error handling).
   - At least one Boundary / Edge Case scenario.
   - If applicable, at least one Integration / Cross-system scenario.
3. Each test case MUST be unique in its **title**, **description**, and **expectedResult**.
4. Do NOT repeat the same scenario with only small wording changes.
5. If two scenarios test exactly the same behavior and expected result, keep only ONE of them and make it the clearest version.
6. Use the **exact actor terms** from the SRS (e.g., "Patron", "Customer Service (CS)", "Customer") instead of generic "user".
7. When the SRS defines which actor can see which data (e.g., Customer sees only own requests, CS sees all), create separate test cases per actor with those exact rules.
8. For FUNCTIONAL features: Create functional test cases (Happy Path, Negative, Alternative Paths).
9. For DATA features: Create data validation test cases (Field validation, Boundary tests, Data integrity).
10. For WORKFLOW features: Create end-to-end workflow test cases following exact steps from SRS.
11. For QUALITY features: Create non-functional test cases (Performance, Security, Usability, Availability) using the exact numeric targets from the SRS when available.
12. For INTERFACE features: Create interface test cases (UI, API, Hardware interfaces).
13. For REPORT features: Use the exact report name, fields, performance constraints, and access rules from the SRS context.
14. For CONSTRAINT features: Create business rule and compliance test cases.
15. For NOTIFICATION features: Create notification delivery and content test cases.

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
- Generate multiple test cases covering different scenarios (Happy Path, Negative, Boundary, Edge Cases, Integration if applicable).
- Make sure **no two test cases are duplicates** (same behavior, same steps, same expectedResult).
- Reference specific SRS sections when available.
- Use exact terminology and values from SRS.
- Ensure JSON is valid and parseable.

**Feature Description:**
{featureDescription}
{sectionContext}

**Project Requirements Context:**
{context}

**FINAL INSTRUCTIONS:**
1. Generate between 5 and 8 UNIQUE test cases covering different scenarios (Happy Path, Negative, Boundary, Edge, Integration where relevant).
2. Before returning, REVIEW the list and REMOVE any duplicate or overlapping test cases (keep only the best version of each scenario).
3. Return ONLY a valid JSON object with "testCases" array - no other text.
4. Ensure all JSON is properly formatted and valid (no trailing commas, all quotes correct).

Generate comprehensive and UNIQUE test cases now. Return ONLY the JSON object:`
    );

    const formattedPrompt = await prompt.format({
      featureDescription,
      context,
      featureType,
      featureTypeGuidance,
      sectionContext,
    });

    const parsed = await invokeJSONPrompt(llm, formattedPrompt, {
      maxRetries: 2,
      minDepth: 1,
    });
    let testCases = [];
    if (Array.isArray(parsed)) {
      testCases = parsed;
    } else if (parsed.testCases && Array.isArray(parsed.testCases)) {
      testCases = parsed.testCases;
    } else if (typeof parsed === "object") {
      const arrayKeys = Object.keys(parsed).filter((key) =>
        Array.isArray(parsed[key])
      );
      if (arrayKeys.length > 0) {
        testCases = parsed[arrayKeys[0]];
      }
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      console.warn("No test cases generated or invalid format");
      return [];
    }

    // Remove duplicated test cases (same title + description + expectedResult)
    const dedupedTestCases = dedupeByKey(testCases, normalizeTestCaseKey);

    const enhancedTestCases = dedupedTestCases
      .filter((tc) => tc && typeof tc === "object")
      .map((tc, index) => {
        if (!tc.title) {
          console.warn(
            `Test case at index ${index} missing title, skipping`
          );
          return null;
        }

        return {
          title: String(tc.title || `Test Case ${index + 1}`),
          description: String(tc.description || ""),
          steps: Array.isArray(tc.steps)
            ? tc.steps.map((s) => String(s))
            : [],
          expectedResult: String(tc.expectedResult || ""),
          priority: ["high", "medium", "low"].includes(
            tc.priority?.toLowerCase()
          )
            ? tc.priority.toLowerCase()
            : "medium",
          status: "pending",
          preconditions: Array.isArray(tc.preconditions)
            ? tc.preconditions.map((p) => String(p))
            : [],
          testCaseId:
            tc.testCaseId ||
            `TC_${String(index + 1).padStart(3, "0")}`,
          testData: tc.testData || {},
        };
      })
      .filter((tc) => tc !== null);

    console.log(
      `Successfully generated ${enhancedTestCases.length} test cases for feature type: ${featureType}`
    );

    return enhancedTestCases;
  } catch (error) {
    console.error("Error generating test cases from RAG:", error);
    throw error;
  }
}