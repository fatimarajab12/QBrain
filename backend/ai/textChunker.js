// Text chunking utility for RAG system

/**
 * Split text into chunks with overlap
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Maximum chunk size in characters
 * @param {number} overlap - Overlap size between chunks
 * @returns {Array<string>} Array of text chunks
 */
export function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    let chunk = text.slice(startIndex, endIndex);

    // Try to break at sentence boundaries if not at the end
    if (endIndex < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > chunkSize * 0.5) {
        // Only break if we're at least halfway through the chunk
        chunk = chunk.slice(0, breakPoint + 1);
        startIndex += breakPoint + 1 - overlap;
      } else {
        startIndex += chunkSize - overlap;
      }
    } else {
      startIndex = text.length;
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Split text into chunks by paragraphs
 * @param {string} text - Text to chunk
 * @param {number} maxChunkSize - Maximum chunk size
 * @returns {Array<string>} Array of text chunks
 */
export function splitTextByParagraphs(text, maxChunkSize = 1000) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    if (currentChunk.length + trimmedParagraph.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmedParagraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = trimmedParagraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Split text into chunks by sentences
 * @param {string} text - Text to chunk
 * @param {number} maxChunkSize - Maximum chunk size
 * @returns {Array<string>} Array of text chunks
 */
export function splitTextBySentences(text, maxChunkSize = 1000) {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Simple sentence splitting (can be improved with NLP libraries)
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? " " : "") + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Smart chunking: tries to preserve structure (paragraphs, sections)
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Target chunk size
 * @param {number} overlap - Overlap size
 * @returns {Array<string>} Array of text chunks
 */
export function smartChunkText(text, chunkSize = 1000, overlap = 200) {
  if (!text || typeof text !== "string") {
    return [];
  }

  // First try paragraph-based chunking
  let chunks = splitTextByParagraphs(text, chunkSize);

  // If chunks are too large, split by sentences
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length <= chunkSize) {
      finalChunks.push(chunk);
    } else {
      finalChunks.push(...splitTextBySentences(chunk, chunkSize));
    }
  }

  // Apply overlap if needed
  if (overlap > 0 && finalChunks.length > 1) {
    const overlappedChunks = [finalChunks[0]];

    for (let i = 1; i < finalChunks.length; i++) {
      const prevChunk = finalChunks[i - 1];
      const currentChunk = finalChunks[i];

      const overlapText = prevChunk.slice(-overlap);
      overlappedChunks.push(overlapText + " " + currentChunk);
    }

    return overlappedChunks;
  }

  return finalChunks;
}

