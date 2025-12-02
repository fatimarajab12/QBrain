import { OpenAIEmbeddings } from "@langchain/openai";

let embeddingsInstance = null;

// Use the cheapest embedding model: text-embedding-3-small
// Cost: $0.02 per 1M tokens (vs $0.13 for text-embedding-3-large)
const DEFAULT_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

function getEmbeddingsInstance(model = DEFAULT_EMBEDDING_MODEL) {
  if (!embeddingsInstance || embeddingsInstance.model !== model) {
    embeddingsInstance = new OpenAIEmbeddings({
      model,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return embeddingsInstance;
}

export async function generateEmbedding(text, model = DEFAULT_EMBEDDING_MODEL) {
  if (!text || typeof text !== "string" || text.trim().length === 0)
    throw new Error("Text must be a non-empty string");

  const embeddings = getEmbeddingsInstance(model);

  let attempts = 0;
  while (attempts < 3) {
    try {
      return await embeddings.embedQuery(text.trim());
    } catch (error) {
      attempts++;
      console.warn(`Embedding attempt ${attempts} failed: ${error.message}`);
      if (attempts === 3) throw error;
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}

export async function generateEmbeddingsBatch(texts, model = DEFAULT_EMBEDDING_MODEL) {
  if (!Array.isArray(texts) || texts.length === 0)
    throw new Error("Texts must be a non-empty array");

  const validTexts = texts.filter(t => t && typeof t === "string" && t.trim().length > 0);
  if (!validTexts.length) throw new Error("No valid texts to embed");

  const embeddings = getEmbeddingsInstance(model);

  let attempts = 0;
  while (attempts < 3) {
    try {
      return await embeddings.embedDocuments(validTexts);
    } catch (error) {
      attempts++;
      console.warn(`Batch embedding attempt ${attempts} failed: ${error.message}`);
      if (attempts === 3) throw error;
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}

export function getEmbeddingDimensions(model = DEFAULT_EMBEDDING_MODEL) {
  const dims = {
    "text-embedding-3-small": 1536,  // Cheapest: $0.02 per 1M tokens
    "text-embedding-3-large": 3072,  // More expensive: $0.13 per 1M tokens
    "text-embedding-ada-002": 1536,  // Legacy: $0.10 per 1M tokens
  };
  return dims[model] || 1536;
}

export function getEmbeddings(model = DEFAULT_EMBEDDING_MODEL) {
  return getEmbeddingsInstance(model);
}