/**
 * Retrieval Layer - RAG Context Strategies
 *
 * Convenience re-exports that expose all retrieval-related helpers
 * from the canonical retrieval core modules.
 *
 * New code should import from this file; legacy code continues to use
 * the `ragService` wrappers which re-export from the same cores.
 */

export * from "./retrievalCore.js";
export { detectSRSType } from "./srsDetectionCore.js";
export {
  groupChunksBySections,
  analyzeSectionCoverage,
} from "./sectionsCore.js";

