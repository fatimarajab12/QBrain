/**
 * RAG Service - Main Entry Point
 * 
 * This module exports all RAG service functions organized by category:
 * - Query functions
 * - Feature extraction
 * - Analysis functions
 * - Utility functions
 */

// Query functions
export { queryRAG } from "./query.js";
export { getRAGContext, getComprehensiveRAGContext } from "./retrieval.js";

// Feature extraction
export { generateFeaturesFromRAG } from "./featureExtraction.js";

// Analysis functions
export { generateTestCasesFromRAG, analyzeSectionMatching } from "./analysis.js";

// SRS detection
export { detectSRSType } from "./srsDetection.js";

// Section management
export { groupChunksBySections, analyzeSectionCoverage } from "./sections.js";

// Utilities
export { parseJSONSafely } from "./utils.js";

// Constants (for reference)
export { COMPREHENSIVE_SRS_QUERIES, SRS_TYPE_PATTERNS } from "./constants.js";

