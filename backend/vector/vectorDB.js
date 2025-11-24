// Vector Database helper - Routes to Supabase pgvector
import { supabaseVectorDB } from "./supabaseVectorDB.js";

class VectorDB {
  constructor() {
    this.client = null;
    this.type = process.env.VECTOR_DB_TYPE || "supabase";
    this.initialize();
  }

  async initialize() {
    try {
      if (this.type === "supabase") {
        // Use Supabase pgvector
        this.client = supabaseVectorDB;
        console.log("Supabase Vector DB initialized (pgvector)");
      } else {
        throw new Error(`Vector DB type "${this.type}" not supported. Set VECTOR_DB_TYPE=supabase`);
      }
    } catch (error) {
      console.error("Vector DB initialization error:", error);
      throw error;
    }
  }

  /**
   * Store document chunks with embeddings
   * @param {string} projectId - Project identifier
   * @param {Array<string>} chunks - Text chunks
   * @param {Array<Array<number>>} embeddings - Embedding vectors
   * @param {Array<Object>} metadatas - Metadata for each chunk
   * @returns {Promise<Object>} Success result
   */
  async storeDocumentChunks(projectId, chunks, embeddings, metadatas = []) {
    try {
      return await this.client.storeDocumentChunks(projectId, chunks, embeddings, metadatas);
    } catch (error) {
      console.error("Error storing document chunks:", error);
      throw error;
    }
  }

  /**
   * Search for similar chunks using semantic search
   * @param {string} projectId - Project identifier
   * @param {string} queryText - Query text
   * @param {number} nResults - Number of results to return
   * @returns {Promise<Array>} Similar chunks with metadata
   */
  async searchSimilar(projectId, queryText, nResults = 5) {
    try {
      return await this.client.searchSimilarByText(projectId, queryText, nResults);
    } catch (error) {
      console.error("Error searching similar chunks:", error);
      throw error;
    }
  }

  /**
   * Search using query embedding (when you already have the embedding)
   * @param {string} projectId - Project identifier
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {number} nResults - Number of results
   * @returns {Promise<Array>} Similar chunks
   */
  async searchByEmbedding(projectId, queryEmbedding, nResults = 5) {
    try {
      return await this.client.searchByEmbedding(projectId, queryEmbedding, nResults);
    } catch (error) {
      console.error("Error searching by embedding:", error);
      throw error;
    }
  }

  /**
   * Delete collection for a project
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Success result
   */
  async deleteCollection(projectId) {
    try {
      return await this.client.deleteCollection(projectId);
    } catch (error) {
      console.error("Error deleting collection:", error);
      throw error;
    }
  }

  /**
   * Get collection info
   * @param {string} projectId - Project identifier
   * @returns {Promise<Object>} Collection information
   */
  async getCollectionInfo(projectId) {
    try {
      return await this.client.getCollectionInfo(projectId);
    } catch (error) {
      console.error("Error getting collection info:", error);
      throw error;
    }
  }
}

// Singleton instance
export const vectorDB = new VectorDB();
