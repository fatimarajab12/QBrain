
export function cleanText(text) {
  if (!text || typeof text !== "string") return "";
  
  return text
    .replace(/\s+/g, " ")      // Replace multiple spaces with single space
    .replace(/\n+/g, " ")      // Replace multiple newlines with space
    .replace(/\t+/g, " ")      // Replace tabs with space
    .replace(/\r+/g, " ")      // Replace carriage returns
    .trim();
}


export function createSectionStyleEmbedding(sectionId, title, content) {
  const cleanedContent = cleanText(content);
  return `SECTION: ${sectionId}\nTITLE: ${title}\nCONTENT: ${cleanedContent}`;
}


export function boostTitle(title, text) {
  if (!title || !text) return text;
  const cleanedTitle = cleanText(title);
  const cleanedText = cleanText(text);
  return `${cleanedTitle} ${cleanedTitle} ${cleanedTitle}\n${cleanedText}`;
}


export function expandQuery(query) {
  if (!query || typeof query !== "string") return query;
  
  const relatedTerms = [
    "requirement",
    "steps",
    "workflow",
    "service flow",
    "customer request",
    "technical check",
    "inventory",
    "invoice",
    "payment",
    "SRS section",
    "feature",
    "specification",
    "documentation"
  ].join(", ");
  
  return `${query}\nrelated terms: ${relatedTerms}`;
}


export function normalizeVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) return vector;
  
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude === 0) return vector;
  
  return vector.map(x => x / magnitude);
}


export function extractSectionNumbers(text) {
  if (!text || typeof text !== "string") return [];
  
  // Pattern to match section numbers like: 3.2.1, 4.1.2.3, etc.
  const sectionPattern = /\d+(\.\d+)+/g;
  const matches = text.matchAll(sectionPattern);
  
  const sections = new Set();
  for (const match of matches) {
    sections.add(match[0]);
  }
  
  return Array.from(sections);
}


export function extractKeywords(text, maxKeywords = 10) {
  if (!text || typeof text !== "string") return [];
  
  // Simple keyword extraction: words longer than 3 characters, excluding common stop words
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "should", "could", "may", "might", "must", "can", "this",
    "that", "these", "those", "what", "which", "who", "when", "where",
    "why", "how", "all", "each", "every", "some", "any", "no", "not"
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}


export function createSemanticHash(text) {
  if (!text || typeof text !== "string") return "";
  
  // Simple hash: take first 50 characters of cleaned text
  const cleaned = cleanText(text).toLowerCase().replace(/\s+/g, "");
  return cleaned.substring(0, 50);
}


export function enrichSectionText(sectionData) {
  const { sectionId, title, content, level } = sectionData;
  
  // Clean inputs
  const cleanedTitle = cleanText(title || "");
  const cleanedContent = cleanText(content || "");
  
  // Create section-style format
  let enriched = `SECTION: ${sectionId || "Unknown"}\n`;
  enriched += `TITLE: ${cleanedTitle}\n`;
  enriched += `CONTENT: ${cleanedContent}`;
  
  // Boost title (repeat 3 times)
  if (cleanedTitle) {
    enriched = `${cleanedTitle} ${cleanedTitle} ${cleanedTitle}\n${enriched}`;
  }
  
  return enriched;
}

