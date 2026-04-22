import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  getRAGContext,
  getComprehensiveRAGContext,
} from "../retrieval/retrievalCore.js";
import { dedupeByKey, invokeJSONPrompt } from "./jsonUtils.js";
import {
  createTestCasePromptByFeatureType,
  TEST_CASE_GENERATION_PROMPT_TEMPLATE,
  TEST_CASE_EXAMPLES,
  COMMON_MISTAKES_WARNING,
  SELF_CHECK_INSTRUCTIONS,
  SECOND_PASS_IMPROVEMENT_PROMPT,
} from "./prompts/index.js";

async function getContextFromSections(
  projectId,
  sectionNumbers,
  nChunksPerSection = 3
) {
  if (!sectionNumbers || sectionNumbers.length === 0) {
    return [];
  }

  // Run retrieval for all sections in parallel for better performance
  const sectionPromises = sectionNumbers.map((sectionNum) =>
    (async () => {
      try {
        const query = `section ${sectionNum} requirements specifications`;
        const chunks = await getRAGContext(projectId, query, nChunksPerSection);
        return chunks.map((chunk) => ({
          ...chunk,
          sourceSection: sectionNum,
        }));
      } catch (error) {
        console.warn(
          `Could not retrieve context for section ${sectionNum}:`,
          error.message
        );
        return [];
      }
    })()
  );

  const results = await Promise.all(sectionPromises);
  return results.flat();
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

    const context = contextChunks
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

    // Combine test case examples for the prompt
    const testCaseExamples = `${TEST_CASE_EXAMPLES.FUNCTIONAL}\n\n${TEST_CASE_EXAMPLES.QUALITY}`;


    const prompt = PromptTemplate.fromTemplate(
      TEST_CASE_GENERATION_PROMPT_TEMPLATE
    );

    const formattedPrompt = await prompt.format({
      featureDescription,
      context,
      featureType,
      featureTypeGuidance,
      sectionContext,
      testCaseExamples,
      commonMistakesWarning: COMMON_MISTAKES_WARNING,
      selfCheckInstructions: SELF_CHECK_INSTRUCTIONS,
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
    let dedupedTestCases = dedupeByKey(testCases, normalizeTestCaseKey);

    // ===== SECOND PASS IMPROVEMENT =====
    // Use second-pass prompt to improve and enhance the generated test cases
    try {
      const secondPassPrompt = PromptTemplate.fromTemplate(SECOND_PASS_IMPROVEMENT_PROMPT);
      const secondPassFormatted = await secondPassPrompt.format({
        testCases: JSON.stringify(dedupedTestCases, null, 2),
        featureType: featureType,
      });

      const improvedResult = await invokeJSONPrompt(llm, secondPassFormatted, {
        maxRetries: 1, // Less retries for improvement pass
        minDepth: 1,
      });

      if (improvedResult && Array.isArray(improvedResult)) {
        dedupedTestCases = improvedResult;
        console.log(`Second-pass improvement applied: ${dedupedTestCases.length} test cases enhanced`);
      }
    } catch (error) {
      console.warn("Second-pass improvement failed, continuing with original test cases:", error.message);
    }

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

    // Apply quality scoring
    const scoredTestCases = scoreTestCasesQuality(enhancedTestCases, featureType);

    // Quality filtering - remove low-quality test cases
    const finalTestCases = scoredTestCases.filter(tc => tc.qualityScore >= 60);

    console.log(
      `Generated ${scoredTestCases.length} test cases, kept ${finalTestCases.length} after quality filtering for feature type: ${featureType}`
    );

    return finalTestCases;
  } catch (error) {
    console.error("Error generating test cases from RAG:", error);
    throw error;
  }
}
function scoreTestCasesQuality(testCases, featureType) {
  return testCases.map(tc => {
    let score = 0;
    let maxScore = 100;
    const feedback = [];

    // Title Quality (20 points)
    if (tc.title && tc.title.length > 30 && tc.title.length < 150) {
      score += 20;
    } else if (tc.title && tc.title.length > 15) {
      score += 10;
      feedback.push("Title could be more descriptive");
    } else {
      feedback.push("Title too short or missing");
    }

    // SRS Reference (20 points)
    const hasSRSRef = /SRS|section \d+\.\d+|requirement [A-Z]+-\d+/i.test(
      `${tc.title} ${tc.description || ''}`
    );
    if (hasSRSRef) {
      score += 20;
    } else {
      feedback.push("Missing SRS section reference");
    }

    // Steps Quality (20 points)
    if (tc.steps && tc.steps.length >= 3) {
      const hasActionVerbs = tc.steps.some(s =>
        /^(login|navigate|click|enter|select|verify|submit|open|fill|choose)/i.test(s)
      );
      score += hasActionVerbs ? 20 : 10;
      if (!hasActionVerbs) feedback.push("Steps need more specific action verbs");
    } else {
      feedback.push("Too few steps or missing");
    }

    // Expected Result Quality (20 points)
    if (tc.expectedResult && tc.expectedResult.length > 30) {
      const isSpecific = /\d+|status|message|notification|displays?|creates?|sends?/i.test(tc.expectedResult);
      score += isSpecific ? 20 : 10;
      if (!isSpecific) feedback.push("Expected result needs more specific details");
    } else {
      feedback.push("Expected result too vague or missing");
    }

    // Preconditions (10 points)
    if (tc.preconditions && tc.preconditions.length > 0) {
      score += 10;
    } else {
      feedback.push("Missing preconditions");
    }

    // Test Data (10 points)
    if (tc.testData && Object.keys(tc.testData).length > 0) {
      score += 10;
    } else {
      feedback.push("Consider adding testData object");
    }

    return {
      ...tc,
      qualityScore: score,
      qualityGrade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      qualityFeedback: feedback
    };
  });
}

// Export the scoring function for use in other modules
export { scoreTestCasesQuality };
