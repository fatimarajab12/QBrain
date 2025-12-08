import { OpenAIEmbeddings } from "@langchain/openai";
import { cleanText, normalizeVector } from "../utils/textProcessing.js";

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


export async function generateEmbedding(text, model = DEFAULT_EMBEDDING_MODEL, normalize = true) {
  if (!text || typeof text !== "string" || text.trim().length === 0)
    throw new Error("Text must be a non-empty string");

  // Clean and normalize text before embedding
  const cleanedText = cleanText(text);
  if (!cleanedText) throw new Error("Text is empty after cleaning");

  const embeddings = getEmbeddingsInstance(model);

  let attempts = 0;
  while (attempts < 3) {
    try {
      const embedding = await embeddings.embedQuery(cleanedText);
      // Normalize vector for better cosine similarity
      return normalize ? normalizeVector(embedding) : embedding;
    } catch (error) {
      attempts++;
      console.warn(`Embedding attempt ${attempts} failed: ${error.message}`);
      if (attempts === 3) throw error;
      await new Promise(res => setTimeout(res, 500 * attempts));
    }
  }
}


export async function generateEmbeddingsBatch(texts, model = DEFAULT_EMBEDDING_MODEL, normalize = true) {
  if (!Array.isArray(texts) || texts.length === 0)
    throw new Error("Texts must be a non-empty array");

  // Clean all texts before embedding
  const cleanedTexts = texts
    .map(text => text && typeof text === "string" ? cleanText(text) : null)
    .filter(text => text && text.length > 0);
  
  if (!cleanedTexts.length) throw new Error("No valid texts to embed after cleaning");

  const embeddings = getEmbeddingsInstance(model);

  let attempts = 0;
  while (attempts < 3) {
    try {
      const embeddingVectors = await embeddings.embedDocuments(cleanedTexts);
      // Normalize all vectors for better cosine similarity
      return normalize ? embeddingVectors.map(v => normalizeVector(v)) : embeddingVectors;
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