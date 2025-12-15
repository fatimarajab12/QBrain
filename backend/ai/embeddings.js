/**
 * Backward-compatibility wrapper for embeddings.
 *
 * The actual implementation now lives in:
 *   - backend/ai/ingestion/embeddings.js
 *
 * Keeping this file as a thin re-export ensures existing imports
 * like `../ai/embeddings.js` continue to work.
 */

export * from "./ingestion/embeddings.js";