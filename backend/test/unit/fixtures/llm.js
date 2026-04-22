export const llmJsonTexts = {
  codeBlock: "```json\n{ \"a\": 1 }\n```",
  withIntro: "Sure! Here is the JSON:\n{ \"a\": 1, \"b\": 2 }\nThanks!",
  trailingComma: "{ \"a\": 1, }",
  arrayWithNoise: "blah blah\n[ {\"t\":1}, {\"t\":2} ]\nend",
  badNewlinesInString: "{ \"msg\": \"line1\nline2\" }",
};

export const llmGeneratedTestCasesPayload = {
  testCases: [
    {
      title: "TC login ok",
      description: "valid",
      steps: ["Enter email", "Enter password", "Click login"],
      expectedResult: "User is redirected to dashboard",
      priority: "High",
      preconditions: ["User exists"],
    },
    // duplicate (same title/description/expectedResult) to exercise dedupe
    {
      title: "TC login ok",
      description: "valid",
      steps: ["Enter email", "Enter password", "Click login"],
      expectedResult: "User is redirected to dashboard",
      priority: "High",
      preconditions: ["User exists"],
    },
    // messy case to exercise normalization
    {
      title: "TC edge",
      steps: "NOT_ARRAY",
      expectedResult: 123,
      priority: "unknown",
    },
  ],
};


