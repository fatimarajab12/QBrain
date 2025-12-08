/**
 * RAG Service - Backward Compatibility Wrapper
 * 
 * This file maintains backward compatibility by re-exporting all functions
 * from the new modular structure in ./ragService/
 * 
 * The code has been refactored into separate modules:
 * - constants.js: Constants and configuration
 * - utils.js: Utility functions
 * - srsDetection.js: SRS type detection
 * - retrieval.js: Context retrieval functions
 * - sections.js: Section grouping and coverage analysis
 * - prompts.js: Adaptive prompt generation
 * - featureExtraction.js: Feature extraction functions
 * - analysis.js: Test cases, bug analysis, section matching
 * - query.js: RAG query functions
 * - index.js: Main exports
 */

// Re-export everything from the new modular structure
export * from "./ragService/index.js";
