import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { testCase } from "../fixtures/index.js";
import { silenceConsole } from "../helpers/console.js";

// Keep prompts simple (avoid LangChain internals in unit tests)
let lastPromptVars = null;
jest.unstable_mockModule("@langchain/core/prompts", () => ({
  PromptTemplate: {
    fromTemplate: () => ({
      format: async (vars) => {
        lastPromptVars = vars;
        return "PROMPT";
      },
    }),
  },
}));

const getRAGContext = jest.fn().mockResolvedValue([
  { text: "3.2 Login requirements ...", metadata: { sectionId: "3.2" } },
]);

jest.unstable_mockModule("../../../ai/retrieval/retrievalCore.js", () => ({
  getRAGContext,
}));

const llmInvoke = jest.fn();

jest.unstable_mockModule("../../../ai/config/llmClient.js", () => ({
  createChatModel: () => ({ invoke: llmInvoke }),
}));

const findById = jest.fn(() => ({
  populate: () =>
    Promise.resolve({
      name: "Login",
      description: "Login feature",
      featureType: "FUNCTIONAL",
      priority: "High",
      acceptanceCriteria: ["AC1"],
    }),
}));

jest.unstable_mockModule("../../../models/Feature.js", () => ({
  Feature: { findById },
}));

const { convertTestCaseToGherkinWithAI } = await import(
  "../../../ai/reasoning/gherkinConversion.js"
);

describe("gherkinConversion", () => {
  let restoreConsole;

  beforeEach(() => {
    lastPromptVars = null;
    llmInvoke.mockReset();
    findById.mockClear();
    getRAGContext.mockClear();

    restoreConsole = silenceConsole();
  });

  afterEach(() => {
    restoreConsole?.();
  });

  it("strips code fences and ensures Feature header exists", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: "```gherkin\nScenario: Works\nGiven x\nWhen y\nThen z\n```",
    });

    const out = await convertTestCaseToGherkinWithAI(testCase, "p1", {
      includeFeatureContext: false, // avoid DB path for this test
      improveWording: true,
    });

    // The function enforces Feature: prefix
    expect(out.startsWith("Feature:")).toBe(true);
    expect(out).not.toContain("```");
  });

  it("does not call Feature.findById when includeFeatureContext is false", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: "Feature: Login\n\n  Scenario: Works\n    Given x\n    When y\n    Then z",
    });
    await convertTestCaseToGherkinWithAI(testCase, "p1", {
      includeFeatureContext: false,
    });
    expect(findById).not.toHaveBeenCalled();
  });

  it("does not call Feature.findById when featureId is missing", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: "Feature: Login\n\n  Scenario: Works\n    Given x\n    When y\n    Then z",
    });

    const tc = { ...testCase, featureId: undefined };
    await convertTestCaseToGherkinWithAI(tc, "p1", {
      includeFeatureContext: true,
    });

    expect(findById).not.toHaveBeenCalled();
  });

  it("calls Feature.findById when includeFeatureContext is true and featureId exists", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: "Feature: Login\n\n  Scenario: Works\n    Given x\n    When y\n    Then z",
    });

    await convertTestCaseToGherkinWithAI(testCase, "p1", {
      includeFeatureContext: true,
    });

    expect(findById).toHaveBeenCalledWith("feature123");
    // Prompt vars include featureContext placeholder (even if empty string)
    expect(typeof lastPromptVars.featureContext).toBe("string");
  });

  it("adds Feature header when LLM output lacks it", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: "Scenario: Works\nGiven x\nWhen y\nThen z",
    });

    const out = await convertTestCaseToGherkinWithAI(testCase, "p1", {
      includeFeatureContext: false,
    });

    expect(out.startsWith("Feature:")).toBe(true);
  });
});


