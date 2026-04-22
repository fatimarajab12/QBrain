import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { llmGeneratedTestCasesPayload, mockChunks } from "../fixtures/index.js";
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

const getRAGContext = jest.fn().mockResolvedValue(mockChunks);
const getComprehensiveRAGContext = jest.fn().mockResolvedValue({
  chunks: mockChunks,
  byCategory: {},
  totalQueries: 0,
  totalChunks: mockChunks.length,
});

jest.unstable_mockModule("../../../ai/retrieval/retrievalCore.js", () => ({
  getRAGContext,
  getComprehensiveRAGContext,
}));

const llmInvoke = jest.fn();

jest.unstable_mockModule("../../../ai/config/llmClient.js", () => ({
  createChatModel: () => ({ invoke: llmInvoke }),
}));

const { generateTestCasesFromRAG } = await import(
  "../../../ai/reasoning/testCaseGeneration.js"
);

describe("testCaseGeneration", () => {
  let restoreConsole;

  beforeEach(() => {
    lastPromptVars = null;
    llmInvoke.mockReset();
    getRAGContext.mockClear();
    getComprehensiveRAGContext.mockClear();

    restoreConsole = silenceConsole();
  });

  afterEach(() => {
    restoreConsole?.();
  });

  it("dedupes and normalizes generated test cases", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify(llmGeneratedTestCasesPayload),
    });

    const out = await generateTestCasesFromRAG("p1", "Login feature", {
      model: "gpt-4o-mini",
      nContextChunks: 2,
      featureType: "FUNCTIONAL",
    });

    // One duplicate should be removed
    expect(out.length).toBe(2);

    // Normalization
    expect(out[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        description: expect.any(String),
        steps: expect.any(Array),
        expectedResult: expect.any(String),
        priority: expect.any(String),
        status: "pending",
        preconditions: expect.any(Array),
        testCaseId: expect.stringMatching(/^TC_\d{3}$/),
      })
    );

    // Priority normalized to lowercase or default medium
    expect(["high", "medium", "low"]).toContain(out[0].priority);
    expect(["high", "medium", "low"]).toContain(out[1].priority);
  });

  it("returns [] when LLM payload has no test cases", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify({ testCases: [] }),
    });

    const out = await generateTestCasesFromRAG("p1", "Any feature", {});
    expect(out).toEqual([]);
  });

  it("skips test cases missing title", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify({
        testCases: [{ description: "no title", steps: ["a"], expectedResult: "b" }],
      }),
    });

    const out = await generateTestCasesFromRAG("p1", "Any feature", {});
    expect(out).toEqual([]);
  });

  it("uses comprehensive retrieval when enabled", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify(llmGeneratedTestCasesPayload),
    });

    await generateTestCasesFromRAG("p1", "Login feature", {
      useComprehensiveRetrieval: true,
    });

    expect(getComprehensiveRAGContext).toHaveBeenCalledTimes(1);
  });

  it("adds sectionContext + per-section retrieval when matchedSections provided", async () => {
    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify(llmGeneratedTestCasesPayload),
    });

    await generateTestCasesFromRAG("p1", "Login feature", {
      matchedSections: ["3.2", "4.1.2"],
    });

    // Per-section retrieval queries
    expect(getRAGContext).toHaveBeenCalledWith(
      "p1",
      "section 3.2 requirements specifications",
      3
    );
    expect(getRAGContext).toHaveBeenCalledWith(
      "p1",
      "section 4.1.2 requirements specifications",
      3
    );

    // Prompt vars should include sectionContext string
    expect(lastPromptVars.sectionContext).toContain("3.2, 4.1.2");
  });
});


