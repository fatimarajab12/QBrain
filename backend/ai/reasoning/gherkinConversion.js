import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRAGContext } from "../retrieval/retrievalCore.js";
import { Feature } from "../../models/Feature.js";
import { GHERKIN_CONVERSION_PROMPT_TEMPLATE } from "./prompts/index.js";

function isValidGherkin(gherkin) {
  return (
    /Feature:/i.test(gherkin) &&
    /Scenario:/i.test(gherkin) &&
    /Given/i.test(gherkin) &&
    /When/i.test(gherkin) &&
    /Then/i.test(gherkin)
  );
}

export async function convertTestCaseToGherkinWithAI(
  testCase,
  projectId,
  options = {}
) {
  try {
    const {
      model = "gpt-4o-mini",
      includeFeatureContext = true,
      improveWording = true,
    } = options;

    let featureContext = "";
    if (includeFeatureContext && testCase.featureId) {
      try {
        const feature = await Feature.findById(testCase.featureId).populate(
          "projectId",
          "name"
        );
        if (feature) {
          featureContext = `
**Feature Information:**
- Feature Name: ${feature.name}
- Feature Description: ${feature.description || "N/A"}
- Feature Type: ${feature.featureType || "FUNCTIONAL"}
- Priority: ${feature.priority || "Medium"}
- Acceptance Criteria: ${
            Array.isArray(feature.acceptanceCriteria)
              ? feature.acceptanceCriteria.join(", ")
              : "N/A"
          }
`;
        }
      } catch (error) {
        console.warn("Could not fetch feature context:", error.message);
      }
    }

    let srsContext = "";
    if (projectId) {
      try {
        const contextQuery = `${testCase.title} ${
          testCase.description || ""
        } ${testCase.expectedResult || ""}`;
        const contextChunks = await getRAGContext(
          projectId,
          `functional requirement acceptance criteria ${contextQuery}`,
          5
        );
        if (contextChunks && contextChunks.length > 0) {
          srsContext = `
**Relevant SRS Context (Structured):**
${contextChunks
  .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
  .slice(0, 5)
  .map(
    (chunk, idx) => `
[CONTEXT ${idx + 1}]
Category: ${chunk.category || "GENERAL"}
Relevance: ${(chunk.relevance || 0).toFixed(2)}
Content:
${chunk.text}
`
  )
  .join("\n")}
`;
        }
      } catch (error) {
        console.warn("Could not fetch SRS context:", error.message);
      }
    }

    // Smart scenario naming from test case title
    const scenarioName =
      testCase.title
        ?.replace(/[^a-zA-Z0-9\s]/g, "")
        .trim() ||
      "Valid Scenario";

    const llm = createChatModel({
      model: improveWording ? "gpt-4o" : "gpt-4o-mini",
      temperature: 0.2,
    });

    const prompt = PromptTemplate.fromTemplate(
      GHERKIN_CONVERSION_PROMPT_TEMPLATE
    );

    const formattedPrompt = await prompt.format({
      scenarioName,
      featureContext: featureContext || "",
      srsContext: srsContext || "",
      title: testCase.title || "Test Scenario",
      description: testCase.description || "",
      preconditions:
        Array.isArray(testCase.preconditions) &&
        testCase.preconditions.length > 0
          ? testCase.preconditions.join("\n- ")
          : "None",
      steps:
        Array.isArray(testCase.steps) && testCase.steps.length > 0
          ? testCase.steps
              .map((step, idx) => `${idx + 1}. ${step}`)
              .join("\n")
          : "No steps provided",
      expectedResult: testCase.expectedResult || "No expected result provided",
    });

    const response = await llm.invoke(formattedPrompt);
    let gherkin = response.content.trim();

    gherkin = gherkin
      .replace(/```gherkin?\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    if (!gherkin.startsWith("Feature:")) {
      const featureMatch = gherkin.match(/Feature:\s*(.+)/i);
      if (featureMatch) {
        gherkin = gherkin.substring(gherkin.indexOf("Feature:"));
      } else {
        const featureName =
          (testCase.title || "Test Feature")
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim() || "Test Feature";
        gherkin = `Feature: ${featureName}\n\n  ${gherkin}`;
      }
    }

    if (!isValidGherkin(gherkin)) {
      throw new Error("Generated Gherkin is invalid or incomplete");
    }

    return gherkin;
  } catch (error) {
    console.error("Error converting test case to Gherkin with AI:", error);
    throw error;
  }
}
