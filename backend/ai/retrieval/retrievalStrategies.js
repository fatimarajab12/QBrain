/**
 * Retrieval Layer - RAG Context Strategies
 *
 * Aggregates retrieval-related helpers from the dedicated retrieval
 * implementation modules. New code should prefer importing from here
 * instead of the legacy `ragService` folder.
 */

export * from "./retrieval.js";
export { detectSRSType } from "./srsDetection.js";
export {
  groupChunksBySections,
  analyzeSectionCoverage,
} from "./sections.js";

