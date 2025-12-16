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
      TEST_CASE_GENERATION_PROMPT_TEMPLATE
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