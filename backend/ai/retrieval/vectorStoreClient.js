/**
 * Retrieval Layer - Vector Store Client
 *
 * Thin wrapper around the existing vector store implementation.
 * This keeps storage concerns in one place while allowing a cleaner
 * AI retrieval structure without breaking existing imports.
 *
 * Existing code can keep importing from:
 *   - ../../vector/vectorStore.js
 *
 * New code can import from:
 *   - ./retrieval/vectorStoreClient.js
 */

export { vectorStore } from "../../vector/vectorStore.js";


