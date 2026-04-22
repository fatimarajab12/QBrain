import { describe, expect, it, jest } from "@jest/globals";

import { vectorStoreResults } from "../fixtures/index.js";

const similaritySearch = jest.fn().mockResolvedValue(vectorStoreResults);
const expandQuery = jest.fn((q) => `EXPANDED:${q}`);

jest.unstable_mockModule("../../../utils/textProcessing.js", () => ({
  expandQuery,
}));

// Mock the vector store so no Supabase/env is needed.
jest.unstable_mockModule("../../../vector/vectorStore.js", () => ({
  vectorStore: { similaritySearch },
}));

const { getRAGContext } = await import("../../../ai/retrieval/retrievalCore.js");

describe("retrievalCore", () => {
  it("getRAGContext maps vectorStore results into {text, metadata, relevance}", async () => {
    const out = await getRAGContext("p1", "login", 2);

    expect(similaritySearch).toHaveBeenCalledTimes(1);
    expect(expandQuery).toHaveBeenCalledWith("login");
    expect(similaritySearch).toHaveBeenCalledWith("p1", "EXPANDED:login", 2);

    expect(out).toEqual([
      { text: "3.2 Login ...", metadata: { sectionId: "3.2" }, relevance: 0.92 },
      {
        text: "4.1.2 Payment ...",
        metadata: { page: 33 },
        relevance: 0.81,
      },
    ]);
  });
});


