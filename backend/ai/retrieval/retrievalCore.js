
import { vectorStore } from "../../vector/vectorStore.js";
import { expandQuery } from "../../utils/textProcessing.js";
import { COMPREHENSIVE_SRS_QUERIES } from "../config/constants.js";

export async function getRAGContext(projectId, query, nResults = 10) {
  try {
    // Expand query with related terms for better retrieval
    const expandedQuery = expandQuery(query);


    const similarChunks = await vectorStore.similaritySearch(
      projectId,
      expandedQuery,
      nResults
    );

    // Transform results: convert distance scores to relevance scores and standardize format
    // Lower distance = higher relevance, so we invert: relevance = 1 - distance
    return similarChunks.map((chunk) => ({
      text: chunk.content,
      metadata: chunk.metadata,
      relevance: 1 - chunk.score, // Convert distance (0-1) to relevance (1 = most relevant)
    }));
  } catch (error) {
    console.error("Error getting RAG context:", error);
    throw error;
  }
}

export async function getComprehensiveRAGContext(
  projectId,
  chunksPerQuery = 5
) {
  try {
    const allChunks = [];
    const chunksByCategory = {};

    // Step 1: Execute specialized queries for each SRS category IN PARALLEL
    // Each query targets a specific semantic space (FUNCTIONAL, DATA, INTERFACE, etc.)
    const retrievalPromises = COMPREHENSIVE_SRS_QUERIES.map((queryInfo) =>
      getRAGContext(projectId, queryInfo.query, chunksPerQuery).then(
        (chunks) => ({
          queryInfo,
          chunks,
        })
      )
    );

    const retrievalResults = await Promise.all(retrievalPromises);

    for (const { queryInfo, chunks } of retrievalResults) {
      // Step 2: Enrich each chunk with category metadata and weighted relevance
      // This prioritizes FUNCTIONAL requirements over QUALITY constraints
      const enrichedChunks = chunks.map((chunk) => {
        const baseRelevance = chunk.relevance ?? 0.5;
        const weight = queryInfo.weight ?? 1.0;

        return {
          ...chunk,
          category: queryInfo.category,
          queryDescription: queryInfo.description,
          adjustedRelevance: baseRelevance * weight,
        };
      });

      allChunks.push(...enrichedChunks);

      // Organize chunks by category for easy access
      if (!chunksByCategory[queryInfo.category]) {
        chunksByCategory[queryInfo.category] = [];
      }
      chunksByCategory[queryInfo.category].push(...enrichedChunks);
    }

    // Step 3: Remove duplicates based on text content
    // Uses first 100 characters as hash to identify duplicate chunks
    // This happens when same chunk appears in multiple query results
    const uniqueChunks = [];
    const seenTexts = new Set();

    for (const chunk of allChunks) {
      const textHash = chunk.text.substring(0, 100).toLowerCase();
      if (!seenTexts.has(textHash)) {
        seenTexts.add(textHash);
        uniqueChunks.push(chunk);
      }
    }

    console.log(
      `Retrieved ${uniqueChunks.length} unique chunks from ${COMPREHENSIVE_SRS_QUERIES.length} queries`
    );
    console.log(
      `Chunks by category:`,
      Object.keys(chunksByCategory)
        .map((cat) => `${cat}: ${chunksByCategory[cat].length}`)
        .join(", ")
    );

    // Step 4: Sort chunks by adjusted relevance (prioritizes FUNCTIONAL over QUALITY)
    uniqueChunks.sort(
      (a, b) => (b.adjustedRelevance || 0) - (a.adjustedRelevance || 0)
    );

    // Step 5: Return organized results
    return {
      chunks: uniqueChunks,
      byCategory: chunksByCategory,
      totalQueries: COMPREHENSIVE_SRS_QUERIES.length,
      totalChunks: uniqueChunks.length,
    };
  } catch (error) {
    console.error("Error getting comprehensive RAG context:", error);
    throw error;
  }
}


