export const mockChunks = [
  {
    text: "3.2 Login: The system shall allow users to login using email/password.",
    metadata: { sectionId: "3.2", page: 12, source: "srs.pdf" },
    relevance: 0.92,
  },
  {
    text: "Reset password requirements: The system shall allow password reset.",
    metadata: { sectionId: "3.3", page: 13, source: "srs.pdf" }, // section only in metadata
    relevance: 0.9,
  },
  {
    text: "4.1.2 Payment: The system shall process payment and generate invoice.",
    metadata: { page: 33 },
    relevance: 0.81,
  },
  {
    text: "General notes: terminology and abbreviations...",
    metadata: { page: 2 },
    relevance: 0.55,
  },
];

export const vectorStoreResults = [
  { content: "3.2 Login ...", metadata: { sectionId: "3.2" }, score: 0.08 },
  { content: "4.1.2 Payment ...", metadata: { page: 33 }, score: 0.19 },
];


