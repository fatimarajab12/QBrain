import { OpenAIEmbeddings } from "@langchain/openai";

let embeddingsInstance = null;

function getEmbeddingsInstance(model = "text-embedding-3-small") {
  if (!embeddingsInstance) {
    embeddingsInstance = new OpenAIEmbeddings({
      model,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return embeddingsInstance;
}

export async function generateEmbedding(text, model = "text-embedding-3-small") {
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

export async function generateEmbeddingsBatch(texts, model = "text-embedding-3-small") {
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

export function getEmbeddingDimensions(model = "text-embedding-3-small") {
  const dims = {
    "text-embedding-3-small": 1536,
    "text-embedding-3-large": 3072,
    "text-embedding-ada-002": 1536,
  };
  return dims[model] || 1536;
}

export function getEmbeddings(model = "text-embedding-3-small") {
  return getEmbeddingsInstance(model);
}