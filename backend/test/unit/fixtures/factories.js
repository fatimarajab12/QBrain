export function makeChunk(overrides = {}) {
  return {
    text: "1.1 Default chunk text",
    metadata: { page: 1, source: "fixture" },
    relevance: 0.5,
    ...overrides,
  };
}

export function makeVectorStoreResult(overrides = {}) {
  return {
    content: "Default content",
    metadata: { page: 1, source: "fixture" },
    score: 0.5,
    ...overrides,
  };
}

export function makeTestCase(overrides = {}) {
  return {
    title: "Default test case title",
    description: "Default description",
    preconditions: ["Default precondition"],
    steps: ["Default step 1"],
    expectedResult: "Default expected result",
    featureId: "feature123",
    ...overrides,
  };
}


