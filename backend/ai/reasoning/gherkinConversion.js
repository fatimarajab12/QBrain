import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRAGContext } from "../retrieval/retrievalCore.js";
import { Feature } from "../../models/Feature.js";

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
          contextQuery,
          3
        );
        if (contextChunks && contextChunks.length > 0) {
          srsContext = `
**Relevant SRS Context:**
${contextChunks.map((chunk) => chunk.text).join("\n\n")}
`;
        }
      } catch (error) {
        console.warn("Could not fetch SRS context:", error.message);
      }
    }

    const llm = createChatModel({
      model,
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(
      `You are an expert QA engineer specializing in Behavior-Driven Development (BDD) and Gherkin syntax.

**TASK:** Convert the following test case into a well-formatted Gherkin feature file.

{featureContext}
{srsContext}

**TEST CASE TO CONVERT:**
- Title: {title}
- Description: {description}
- Preconditions: {preconditions}
- Steps: {steps}
- Expected Result: {expectedResult}

**GHERKIN CONVERSION RULES:**
1. Create a clear Feature name based on the test case title (remove special characters, keep it concise)
2. Use proper Gherkin keywords: Feature, Scenario, Given, When, Then, And, But
3. Ensure steps are clear, concise, and in natural language
4. Use Given for preconditions (initial state/setup)
5. Use When for actions (user actions or system events)
6. Use Then for expected outcomes (verifications/assertions)
7. Use And/But to continue steps of the same type
8. Make steps readable and understandable by non-technical stakeholders
9. Remove any technical jargon and make it business-friendly
10. Ensure proper indentation (2 spaces for Feature/Scenario, 4 spaces for steps)
11. If description exists, add it under Feature with proper indentation (2 spaces)
12. Do not include keywords (Given/When/Then/And) in the step text itself - they are already provided

**IMPORTANT:**
- Output ONLY the Gherkin code, no explanations or markdown formatting
- Do not wrap in code blocks or markdown
- Ensure proper Gherkin syntax
- Make the language natural and business-readable
- Clean up any existing keywords in the steps
- Each step should be on a single line
- Use proper spacing and indentation

**OUTPUT:**`
    );

    const formattedPrompt = await prompt.format({
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

    return gherkin;
  } catch (error) {
    console.error("Error converting test case to Gherkin with AI:", error);
    throw error;
  }
}
