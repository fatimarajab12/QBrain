// Supabase Vector DB helper using pgvector
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../ai/embeddings.js';

class SupabaseVectorDB {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase URL and Service Role Key are required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
    }

    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for backend
    );

    this.initialized = true;
    console.log('Supabase Vector DB client initialized');
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Store document chunks with embeddings
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @param {Array<string>} chunks - Text chunks
   * @param {Array<Array<number>>} embeddings - Embedding vectors
   * @param {Array<Object>} metadatas - Metadata for each chunk
   * @returns {Promise<Object>} Success result
   */
  async storeDocumentChunks(projectId, chunks, embeddings, metadatas = []) {
    await this.ensureInitialized();
    try {
      const records = chunks.map((chunk, index) => ({
        project_id: projectId, // String from MongoDB projectId
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          chunkIndex: index,
          chunkLength: chunk.length,
          timestamp: new Date().toISOString(),
          ...metadatas[index],
        },
      }));

      const { data, error } = await this.client
        .from('project_vectors')
        .insert(records);

      if (error) throw error;

      console.log(`Stored ${chunks.length} chunks for project ${projectId}`);
      return { success: true, chunksCount: chunks.length };
    } catch (error) {
      console.error('Error storing document chunks:', error);
      throw error;
    }
  }

  /**
   * Search for similar chunks using cosine similarity
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {number} nResults - Number of results to return
   * @returns {Promise<Array>} Similar chunks with metadata
   */
  async searchSimilar(projectId, queryEmbedding, nResults = 5) {
    await this.ensureInitialized();
    try {
      // Use Supabase RPC function for vector similarity search
      const { data, error } = await this.client.rpc('match_project_vectors', {
        project_id_param: projectId,
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: nResults,
      });

      if (error) {
        // Fallback to direct query if RPC function doesn't exist
        console.warn('RPC function not found, using direct query:', error.message);
        return await this.searchSimilarDirect(projectId, queryEmbedding, nResults);
      }

      return data.map((item) => ({
        document: item.content,
        metadata: item.metadata || {},
        distance: item.similarity ? 1 - item.similarity : null,
        id: item.id,
      }));
    } catch (error) {
      console.error('Error searching similar chunks:', error);
      throw error;
    }
  }

  /**
   * Direct query fallback (if RPC function doesn't exist)
   */
  async searchSimilarDirect(projectId, queryEmbedding, nResults = 5) {
    try {
      // Get all vectors for the project
      const { data, error } = await this.client
        .from('project_vectors')
        .select('id, content, metadata, embedding')
        .eq('project_id', projectId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      // Calculate similarity manually and sort
      const results = data.map((item) => {
        const similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
        return {
          document: item.content,
          metadata: item.metadata || {},
          distance: 1 - similarity,
          id: item.id,
          similarity: similarity,
        };
      });

      // Sort by similarity (descending) and take top nResults
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, nResults)
        .map(({ similarity, ...rest }) => rest); // Remove similarity from output
    } catch (error) {
      console.error('Error in direct search:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Search using query text (generates embedding first)
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @param {string} queryText - Query text
   * @param {number} nResults - Number of results
   * @returns {Promise<Array>} Similar chunks
   */
  async searchSimilarByText(projectId, queryText, nResults = 5) {
    await this.ensureInitialized();
    try {
      // Generate embedding for query text
      const queryEmbedding = await generateEmbedding(queryText);
      return await this.searchSimilar(projectId, queryEmbedding, nResults);
    } catch (error) {
      console.error('Error searching by text:', error);
      throw error;
    }
  }

  /**
   * Search using query embedding (when you already have the embedding)
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @param {Array<number>} queryEmbedding - Query embedding vector
   * @param {number} nResults - Number of results
   * @returns {Promise<Array>} Similar chunks
   */
  async searchByEmbedding(projectId, queryEmbedding, nResults = 5) {
    await this.ensureInitialized();
    try {
      return await this.searchSimilar(projectId, queryEmbedding, nResults);
    } catch (error) {
      console.error('Error searching by embedding:', error);
      throw error;
    }
  }

  /**
   * Get collection info (chunks count)
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @returns {Promise<Object>} Collection information
   */
  async getCollectionInfo(projectId) {
    await this.ensureInitialized();
    try {
      const { count, error } = await this.client
        .from('project_vectors')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (error) throw error;

      return {
        projectId,
        collectionName: `project_${projectId}`,
        chunksCount: count || 0,
      };
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw error;
    }
  }

  /**
   * Delete all chunks for a project
   * @param {string} projectId - Project identifier (string from MongoDB)
   * @returns {Promise<Object>} Success result
   */
  async deleteCollection(projectId) {
    await this.ensureInitialized();
    try {
      const { error } = await this.client
        .from('project_vectors')
        .delete()
        .eq('project_id', projectId);

      if (error) throw error;

      console.log(`Deleted chunks for project ${projectId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }
}

export const supabaseVectorDB = new SupabaseVectorDB();
