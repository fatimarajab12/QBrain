import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { silenceConsole } from "../helpers/console.js";

// Keep prompts simple (avoid LangChain internals in unit tests)
jest.unstable_mockModule("@langchain/core/prompts", () => ({
  PromptTemplate: {
    fromTemplate: () => ({
      format: async () => "PROMPT",
    }),
  },
}));

// Mock retrieval to control chunks and avoid any real vector store
const getRAGContext = jest.fn();
const getComprehensiveRAGContext = jest.fn();

jest.unstable_mockModule("../../../ai/retrieval/retrievalCore.js", () => ({
  getRAGContext,
  getComprehensiveRAGContext,
}));

// Mock LLM used by feature extraction (profiled model)
const llmInvoke = jest.fn();
jest.unstable_mockModule("../../../ai/config/llmClient.js", () => ({
  createProfiledChatModel: () => ({ invoke: llmInvoke }),
}));

const { generateFeaturesFromRAG } = await import(
  "../../../ai/reasoning/featureExtraction.js"
);

function makeChunk({ text, sectionId, relevance }) {
  return {
    text,
    metadata: sectionId ? { sectionId } : {},
    relevance,
  };
}

describe("featureExtraction", () => {
  let restoreConsole;

  beforeEach(() => {
    restoreConsole = silenceConsole();
    llmInvoke.mockReset();
    getRAGContext.mockReset();
    getComprehensiveRAGContext.mockReset();
  });

  afterEach(() => {
    restoreConsole?.();
  });

  it("filters infra-only features", async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "3.2 Login: The system shall allow users to login ...",
          sectionId: "3.2",
          relevance: 0.8,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 1,
    });

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        {
          name: "Deployment pipeline config",
          description: "deployment pipeline config",
          featureType: "CONSTRAINT",
          priority: "Medium",
          confidence: 0.8,
        },
        {
          name: "Login",
          description: "User can login",
          featureType: "FUNCTIONAL",
          priority: "High",
          confidence: 0.9,
          matchedSections: ["3.2"],
        },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
    });
    const features = result.features;

    expect(features.some((f) => /deployment pipeline/i.test(f.name))).toBe(false);
    expect(features.some((f) => f.name === "Login")).toBe(true);
  });

  it('marks generic QUALITY statements with "Acceptance criteria to be defined"', async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "2.1 Performance requirements ...",
          sectionId: "2.1",
          relevance: 0.7,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 1,
    });

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        {
          name: "Performance",
          description: "System must be fast.",
          featureType: "QUALITY",
          priority: "Medium",
          confidence: 0.9,
          matchedSections: ["2.1"],
        },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
    });
    const perf = result.features.find((f) => f.name === "Performance");

    expect(perf).toBeDefined();
    expect(perf.acceptanceCriteria).toEqual(["Acceptance criteria to be defined"]);
    expect(perf.confidence).toBeLessThanOrEqual(0.75);
  });

  it("aggregates many simple DATA fields into a DATA_MODEL feature", async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "5.1 Data dictionary ...",
          sectionId: "5.1",
          relevance: 0.6,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 1,
    });

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        { name: "Customer ID", description: "", featureType: "DATA", priority: "Medium" },
        { name: "Customer Name", description: "", featureType: "DATA", priority: "Medium" },
        { name: "Customer Address", description: "", featureType: "DATA", priority: "Medium" },
        { name: "Customer Email", description: "", featureType: "DATA", priority: "Medium" },
        { name: "Customer Status", description: "", featureType: "DATA", priority: "Medium" },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
      projectContext: "QBrain",
    });

    const dataModel = result.features.find((f) => f.featureType === "DATA_MODEL");
    expect(dataModel).toBeDefined();
    expect(dataModel.name).toContain("QBrain");
    expect(dataModel.description).toContain("Customer ID");
  });

  it("dedupes features by normalized name (removes trailing (digits))", async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "3.2 Login requirements ...",
          sectionId: "3.2",
          relevance: 0.8,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 1,
    });

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        { name: "Login (1)", description: "First", featureType: "FUNCTIONAL" },
        { name: "Login (2)", description: "Second", featureType: "FUNCTIONAL" },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
    });
    const logins = result.features.filter((f) => f.name.startsWith("Login"));

    expect(logins.length).toBe(1);
  });

  it("dedupes features by description hash (similar descriptions collapse)", async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "7.1 Notifications ...",
          sectionId: "7.1",
          relevance: 0.5,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 1,
    });

    const sameDesc =
      "Notify customer via SMS when payment is received and invoice is generated.";

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        { name: "SMS Notification", description: sameDesc, featureType: "NOTIFICATION" },
        { name: "Payment SMS", description: sameDesc, featureType: "NOTIFICATION" },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
    });
    const notif = result.features.filter((f) => f.featureType === "NOTIFICATION");

    expect(notif.length).toBe(1);
  });

  it("computes relevanceScore/rankingScore and matchedSectionInfo", async () => {
    getComprehensiveRAGContext.mockResolvedValueOnce({
      chunks: [
        makeChunk({
          text: "3.2 Login requirement A ... login ...",
          sectionId: "3.2",
          relevance: 0.8,
        }),
        makeChunk({
          text: "3.2 Login requirement B ... login ...",
          sectionId: "3.2",
          relevance: 0.6,
        }),
      ],
      byCategory: {},
      totalQueries: 1,
      totalChunks: 2,
    });

    llmInvoke.mockResolvedValueOnce({
      content: JSON.stringify([
        {
          name: "Login",
          description: "User can login",
          featureType: "FUNCTIONAL",
          priority: "High",
          confidence: 0.9,
          matchedSections: ["3.2"],
        },
      ]),
    });

    const result = await generateFeaturesFromRAG("p1", {
      useComprehensiveRetrieval: true,
    });
    const login = result.features.find((f) => f.name === "Login");

    expect(login).toBeDefined();

    // relevanceScore = avg(0.8, 0.6) => 0.7
    expect(login.relevanceScore).toBeCloseTo(0.7, 2);

    // rankingScore = 0.7*0.5 + (High=3 => 1)*0.3 + 0.9*0.2 = 0.83
    expect(login.rankingScore).toBeCloseTo(0.83, 2);

    expect(login.matchedSectionInfo).toEqual(
      expect.objectContaining({
        sectionId: "3.2",
        chunksCount: 2,
      })
    );
  });
});


