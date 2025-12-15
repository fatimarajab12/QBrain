/**
 * Backward-compatibility wrapper.
 *
 * The actual implementation now lives in:
 *   - backend/ai/ingestion/documentParser.js
 *
 * Keeping this file as a thin re-export ensures existing imports
 * like `../../services/documentAIService.js` continue to work.
 */

export * from "../ai/ingestion/documentParser.js";

