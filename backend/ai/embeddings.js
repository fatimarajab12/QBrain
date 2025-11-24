// OpenAI Embeddings helper
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for a single text
 * @param {string} text - Text to embed
 * @param {string} model - Embedding model (default: text-embedding-ada-002)
 * @returns {Promise<Array<number>>} Embedding vector
 */
export async function generateEmbedding(text, model = "text-embedding-ada-002") {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("Text must be a non-empty string");
    }

    const response = await openai.embeddings.create({
      model,
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 * @param {Array<string>} texts - Array of texts to embed
 * @param {string} model - Embedding model
 * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
 */
export async function generateEmbeddingsBatch(texts, model = "text-embedding-ada-002") {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error("Texts must be a non-empty array");
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text && typeof text === "string" && text.trim().length > 0);

    if (validTexts.length === 0) {
      throw new Error("No valid texts to embed");
    }

    const response = await openai.embeddings.create({
      model,
      input: validTexts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings batch:", error);
    throw error;
  }
}

/**
 * Get embedding model dimensions
 * @param {string} model - Model name
 * @returns {number} Dimension count
 */
export function getEmbeddingDimensions(model = "text-embedding-ada-002") {
  const dimensions = {
    "text-embedding-ada-002": 1536,
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
  };
  return dimensions[model] || 1536;
}

