/**
 * RAG API Layer - Unified Entry Point (Canonical)
 *
 * This module exposes all RAG-related capabilities from the new
 * ingestion/retrieval/reasoning/config layers under a single namespace.
 *
 */

// Query functions
export { queryRAG } from "./query.js";

// Retrieval
export {
  getRAGContext,
  getComprehensiveRAGContext,
} from "../retrieval/retrievalCore.js";

// Feature extraction
export { generateFeaturesFromRAG } from "../reasoning/featureExtraction.js";

// Analysis functions
export { generateTestCasesFromRAG } from "../reasoning/testCaseGeneration.js";
export { analyzeSectionMatching } from "../reasoning/sectionMatching.js";
export {
  convertTestCaseToGherkinWithAI,
} from "../reasoning/gherkinConversion.js";

// Section management
export {
  groupChunksBySections,
  analyzeSectionCoverage,
} from "../retrieval/sectionsCore.js";

// Utilities
export { parseJSONSafely } from "../reasoning/jsonUtils.js";

// Constants
export {
  COMPREHENSIVE_SRS_QUERIES,
} from "../config/constants.js";

