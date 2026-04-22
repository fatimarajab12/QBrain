/**
 * Reasoning - Feature Extraction from SRS using RAG

 * Core implementation used by the RAG API and services.
 */
import { createProfiledChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  getRAGContext,
  getComprehensiveRAGContext,
} from "../retrieval/retrievalCore.js";
import {
  groupChunksBySections,
  analyzeSectionCoverage,
} from "../retrieval/sectionsCore.js";
import {
  createAdaptivePrompt,
  FEATURE_EXTRACTION_PROMPT_TEMPLATE,
} from "./prompts/index.js";
import { dedupeByKey, parseJSONSafely } from "./jsonUtils.js";

// Feature type classification is now handled by LLM during extraction
// No need for keyword-based fallback classification

// ===== CONSTANTS =====
const SCORING_WEIGHTS = {
  RELEVANCE: 0.5,
  PRIORITY: 0.3,
  CONFIDENCE: 0.2,
};

const PRIORITY_SCORES = {
  High: 3,
  Medium: 2,
  Low: 1,
  default: 1,
};

const DEFAULT_CONFIDENCE = 0.7;
const DEFAULT_RELEVANCE_SCORE = 0.5;
const MIN_DATA_FIELDS_FOR_AGGREGATION = 5;
const MAX_FIELD_NAMES_IN_DESCRIPTION = 15;
const FEATURE_NAME_TRUNCATE_LENGTH = 50;
const CHUNK_TEXT_HASH_LENGTH = 100;

const VALID_FEATURE_TYPES = [
  "FUNCTIONAL",
  "DATA",
  "DATA_MODEL",
  "INTERFACE",
  "QUALITY",
  "REPORT",
  "CONSTRAINT",
  "NOTIFICATION",
  "WORKFLOW",
];

// ===== IMPROVED CHUNK MATCHING =====
function extractKeywords(text) {
  // Extract meaningful words (exclude common stop words)
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from']);
  return text
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 10); // Limit to top 10 keywords
}

function findMatchingChunks(feature, contextChunks) {
  const featureQuery = `${feature.name} ${feature.description}`.toLowerCase();
  const featureKeywords = extractKeywords(featureQuery);
  const featureNameLower = (feature.name || "").toLowerCase();
  
  return contextChunks.filter((chunk) => {
    const chunkText = chunk.text.toLowerCase();
    
    // Multiple matching strategies for better coverage with improved precision
    const keywordMatches = featureKeywords.filter(kw => chunkText.includes(kw));
    return (
      // Exact name match
      chunkText.includes(featureNameLower) ||
      // Keyword matching (at least 2 keywords for better precision)
      keywordMatches.length >= 2 ||
      // Section-based matching
      (feature.matchedSections && feature.matchedSections.some(section =>
        chunk.metadata?.sectionId?.includes(section)
      ))
    );
  });
}

function validateFeature(feature) {
  return (
    feature &&
    typeof feature === "object" &&
    (feature.name || feature.description) // At least one should exist
  );
}

function generateDefaultReasoning(feature, matchedSectionInfo) {
  // Support different types of location identifiers (sections, chapters, pages, etc.)
  if (matchedSectionInfo?.sectionId) {
    const location = matchedSectionInfo.sectionId;
    // Check if it's a chapter, page, or section format
    if (location.toLowerCase().includes('chapter')) {
      return `This feature is explicitly stated in SRS ${location}.`;
    } else if (location.toLowerCase().includes('page')) {
      return `This feature is explicitly stated in SRS ${location}.`;
    } else {
      return `This feature is explicitly stated in SRS section ${location}.`;
    }
  }
  if (feature.matchedSections?.[0]) {
    const location = feature.matchedSections[0];
    // Support different location formats
    if (location.toLowerCase().includes('chapter')) {
      return `This feature is explicitly stated in SRS ${location}.`;
    } else if (location.toLowerCase().includes('page')) {
      return `This feature is explicitly stated in SRS ${location}.`;
    } else {
      return `This feature is explicitly stated in SRS section ${location}.`;
    }
  }
  return "This feature was extracted from the SRS document context.";
}

// ===== IMPROVED FEATURE ENHANCEMENT =====
function enhanceFeatures(features, contextChunks, groupedChunks) {
  return features.map((feature) => {
    // Validate feature structure
    if (!validateFeature(feature)) {
      console.warn("Invalid feature structure, applying defaults:", feature);
      feature = {
        name: feature.name || "Unnamed Feature",
        description: feature.description || "",
        featureType: "FUNCTIONAL",
        ...feature,
      };
    }

    const matchingChunks = findMatchingChunks(feature, contextChunks);

    let matchedSectionInfo = null;
    if (
      groupedChunks &&
      feature.matchedSections &&
      feature.matchedSections.length > 0
    ) {
      const primarySection = feature.matchedSections[0];
      if (groupedChunks.bySection[primarySection]) {
        matchedSectionInfo = {
          sectionId: primarySection,
          chunksCount: groupedChunks.bySection[primarySection].chunks.length,
          ...(groupedChunks.bySection[primarySection].allSections && {
            allSections: groupedChunks.bySection[primarySection].allSections,
          }),
        };
      }
    }

    // Use featureType from LLM, validate it
    const featureType = VALID_FEATURE_TYPES.includes(feature.featureType)
      ? feature.featureType
      : "FUNCTIONAL";

    // Improved relevance score calculation
    const relevanceScore =
      matchingChunks.length > 0
        ? matchingChunks.reduce((sum, chunk) => sum + (chunk.relevance || DEFAULT_RELEVANCE_SCORE), 0) /
          matchingChunks.length
        : DEFAULT_RELEVANCE_SCORE;

    const priorityScore = PRIORITY_SCORES[feature.priority] || PRIORITY_SCORES.default;

    const rankingScore =
      relevanceScore * SCORING_WEIGHTS.RELEVANCE +
      (priorityScore / 3) * SCORING_WEIGHTS.PRIORITY +
      (feature.confidence || DEFAULT_CONFIDENCE) * SCORING_WEIGHTS.CONFIDENCE;

    return {
      ...feature,
      featureType,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      rankingScore: Math.round(rankingScore * 100) / 100,
      matchedChunksCount: matchingChunks.length,
      matchedSectionInfo,
      reasoning:
        feature.reasoning ||
        generateDefaultReasoning(feature, matchedSectionInfo),
      matchedSections: feature.matchedSections || [],
      confidence: feature.confidence || DEFAULT_CONFIDENCE,
    };
  });
}

function normalizeFeatureName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/g, "") // remove trailing numbers only: "(1)", "(2)", ... (not roles like "(User)", "(Admin)")
    .replace(/\s+/g, " ")
    .trim();
}
function looksLikeSimpleDataField(feature) {
  const name = (feature.name || "").trim();
  const description = (feature.description || "").trim();
  if (!name) return false;

  // Very short names with no verbs are likely pure data fields
  const words = name.split(/\s+/);
  if (words.length > 4) return false;

  const lower = name.toLowerCase();
  const hasDataKeyword = /(id|name|number|code|date|amount|fee|status|address|email|mobile|phone|tariff|field|column|attribute)/i.test(
    name
  );
  const hasVerb = /\b(create|update|delete|view|manage|process|generate|send|notify|calculate|validate|verify|check)\b/i.test(
    description || name
  );

  // If it's DATA type, has data keyword, short name, and no verb => treat as raw field
  return (
    (feature.featureType === "DATA" || feature.featureType === "DATA_MODEL") &&
    hasDataKeyword &&
    !hasVerb
  );
}

function looksLikeGenericQualityStatement(feature) {
  const text = `${feature.name || ""} ${feature.description || ""}`.toLowerCase();
  if (!text) return false;

  const hasVeryGenericPattern =
    /system must be (available|robust|scalable|secure|fast|reliable|efficient)/i.test(
      `${feature.description || ""}`
    ) ||
    /^(availability|robustness|scalability|security|performance|reliability)$/i.test(feature.name || "");

  const hasConcreteNumbers =
    /\b\d+(\.\d+)?\s*(seconds?|ms|users?|requests?|%|percent|minutes?|hours?|days?|bytes?|kb|mb|gb)\b/i.test(
      text
    );

  // Keep if there are concrete numeric targets, otherwise drop as too generic
  return hasVeryGenericPattern && !hasConcreteNumbers;
}

function looksLikeInfraOnly(feature) {
  const text = `${feature.name || ""} ${feature.description || ""}`.toLowerCase();
  if (!text) return false;

  // Only filter pure infrastructure/deployment config, not security features
  const infraPatterns = /pure infrastructure|internal hosting only|deployment pipeline config/i;
  return infraPatterns.test(text);
}

// ===== IMPROVED CLEANING =====
function cleanAndDeduplicateFeatures(features, projectContext = null) {
  const dataFieldNames = [];
  const filtered = [];

  for (const feature of features) {
    if (!validateFeature(feature)) {
      console.warn("Skipping invalid feature:", feature);
      continue;
    }

    if (looksLikeSimpleDataField(feature)) {
      dataFieldNames.push(feature.name.trim());
      
      // Keep data fields as individual features if we don't have enough for aggregation
      if (dataFieldNames.length < MIN_DATA_FIELDS_FOR_AGGREGATION) {
        filtered.push({
          ...feature,
          featureType: "DATA",
          confidence: Math.min(feature.confidence || DEFAULT_CONFIDENCE, 0.75),
        });
      }
      continue;
    }

    if (looksLikeGenericQualityStatement(feature)) {
      // Keep quality features but mark them as needing definition
      feature.acceptanceCriteria = feature.acceptanceCriteria?.length
        ? feature.acceptanceCriteria
        : ["Acceptance criteria to be defined"];
      feature.confidence = Math.min(feature.confidence || DEFAULT_CONFIDENCE, 0.75);
      filtered.push(feature);
      continue;
    }

    if (looksLikeInfraOnly(feature)) {
      continue;
    }

    filtered.push(feature);
  }

  // Improved deduplication - check both name and description similarity
  const cleaned = dedupeByKey(filtered, (f) =>
    normalizeFeatureName(f.name || "")
  );

  // Additional deduplication pass for similar descriptions
  const finalFeatures = [];
  const seenDescriptions = new Set();
  
  for (const feature of cleaned) {
    const descHash = normalizeFeatureName(feature.description || "").substring(0, CHUNK_TEXT_HASH_LENGTH);
    if (!seenDescriptions.has(descHash) || !feature.description) {
      seenDescriptions.add(descHash);
      finalFeatures.push(feature);
    }
  }

  // Improved data model feature creation with smart domain detection
  if (dataFieldNames.length >= MIN_DATA_FIELDS_FOR_AGGREGATION) {
    // Extract domain automatically from field names
    const domainHint =
      dataFieldNames.some(f => /customer|client|user/i.test(f)) ? "Customer" :
      dataFieldNames.some(f => /billing|invoice|fee|payment|charge/i.test(f)) ? "Billing" :
      dataFieldNames.some(f => /product|service|item|catalog/i.test(f)) ? "Product" :
      dataFieldNames.some(f => /order|transaction|purchase/i.test(f)) ? "Order" :
      dataFieldNames.some(f => /inventory|stock|warehouse/i.test(f)) ? "Inventory" :
      "System";

    const dataModelName = projectContext
      ? `${projectContext} ${domainHint} Data Model`
      : `${domainHint} Data Model`;
      
    finalFeatures.push({
      featureId: `data_model_${Date.now()}`,
      name: dataModelName,
      description:
        "Logical data model that groups all customer, service, billing and status fields used by the system. " +
        "This replaces individual field features such as: " +
        dataFieldNames.slice(0, MAX_FIELD_NAMES_IN_DESCRIPTION).join(", ") +
        (dataFieldNames.length > MAX_FIELD_NAMES_IN_DESCRIPTION ? ", ..." : ""),
      featureType: "DATA_MODEL",
      priority: "Medium",
      status: "pending",
      acceptanceCriteria: [],
      reasoning:
        "Grouped multiple low-level data fields into a single data model feature for better readability and testability.",
      matchedSections: [],
      confidence: DEFAULT_CONFIDENCE,
    });
  }

  return finalFeatures;
}
// ===== IMPROVED CONTEXT BUILDING =====
function buildContextFromChunks(contextChunks, groupedChunks) {
  if (!groupedChunks) {
    return contextChunks.map((chunk) => chunk.text).join("\n\n");
  }

  const sectionContexts = Object.values(groupedChunks.bySection).map(
    (section) =>
      `[Section ${section.sectionId}]\n${section.chunks
        .map((c) => c.text)
        .join("\n\n")}`
  );
  
  const parts = [sectionContexts.join("\n\n---\n\n")];
  
  if (groupedChunks.ungrouped.length > 0) {
    parts.push(
      "\n\n[Other Content]\n" +
      groupedChunks.ungrouped.map((c) => c.text).join("\n\n")
    );
  }
  
  return parts.join("");
}

// ===== IMPROVED MAIN FUNCTION =====
export async function generateFeaturesFromRAG(projectId, options = {}) {
  try {
    const safeOptions = options && typeof options === "object" ? options : {};

    const {
      nContextChunks = 20,
      model = "gpt-4o-mini",
      useComprehensiveRetrieval = true,
      chunksPerQuery = 7,
      projectContext = null, // New option for context-aware naming
      highRecallMode = true, // Enable high recall mode for maximum feature discovery (default: true)
    } = safeOptions;

    let contextChunks;
    let groupedChunks = null;

    if (useComprehensiveRetrieval) {
      const comprehensiveResult = await getComprehensiveRAGContext(
        projectId,
        chunksPerQuery
      );
      contextChunks = comprehensiveResult.chunks;
      groupedChunks = groupChunksBySections(contextChunks);
      console.log(`Grouped chunks into ${groupedChunks.sectionCount} sections`);
    } else {
      contextChunks = await getRAGContext(
        projectId,
        "requirements features specifications",
        nContextChunks
      );
    }

    if (contextChunks.length === 0) {
      throw new Error("No SRS content found. Please upload SRS document first.");
    }

    const context = buildContextFromChunks(contextChunks, groupedChunks);

    // Use reasoning profile for better extraction accuracy
    const llm = createProfiledChatModel("reasoning", {
      model, // Can override model if needed
      // temperature: 0.3 from profile (better for extraction)
    });

    const adaptivePromptText = createAdaptivePrompt({ highRecallMode });

    const contextStats = groupedChunks
      ? `\n**Context Statistics:**\n- Total sections in context: ${
          groupedChunks.sectionCount
        }\n- Total chunks retrieved: ${
          contextChunks.length
        }\n- This means you have comprehensive coverage of the SRS document.\n`
      : `\n**Context Statistics:**\n- Total chunks retrieved: ${
          contextChunks.length
        }\n- Make sure to extract features from ALL chunks provided.\n`;

    const prompt = PromptTemplate.fromTemplate(
      FEATURE_EXTRACTION_PROMPT_TEMPLATE
    );

    const formattedPrompt = await prompt.format({
      context,
      adaptivePromptText,
      contextStats,
    });
    
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);
    
    if (!parsed) {
      throw new Error("Failed to parse LLM response. The response may not be valid JSON.");
    }
    
    const features = Array.isArray(parsed) ? parsed : parsed.features || [];
    
    if (!Array.isArray(features) || features.length === 0) {
      console.warn("No features extracted from LLM response:", parsed);
      // Don't throw, return empty array with metadata
    }

    const enhancedFeatures = enhanceFeatures(
      features,
      contextChunks,
      groupedChunks
    );
    
    let cleanedFeatures = cleanAndDeduplicateFeatures(
      enhancedFeatures,
      projectContext
    );
    
    cleanedFeatures.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));

    let coverageAnalysis = null;
    if (groupedChunks) {
      coverageAnalysis = analyzeSectionCoverage(
        cleanedFeatures,
        groupedChunks
      );
      console.log(
        `Section coverage: ${coverageAnalysis.coveragePercentage.toFixed(
          1
        )}% (${coverageAnalysis.coveredSections}/${
          coverageAnalysis.totalSections
        } sections)`
      );
    }

    if (useComprehensiveRetrieval) {
      return {
        features: cleanedFeatures,
        metadata: {
          totalFeatures: cleanedFeatures.length,
          featuresByType: Object.entries(
            cleanedFeatures.reduce((acc, f) => {
              const type = f.featureType || "FUNCTIONAL";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count })),
          ...(coverageAnalysis && { coverage: coverageAnalysis }),
          totalChunksProcessed: contextChunks.length,
          sectionsProcessed: groupedChunks?.sectionCount || 0,
        },
      };
    }

    return cleanedFeatures;
  } catch (error) {
    console.error("Error generating features from RAG:", error);
    
    // Improved error handling
    if (error.message?.includes("JSON")) {
      throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
    }
    
    if (error.message?.includes("rate limit") || error.message?.includes("429")) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.");
    }
    
    if (error.message?.includes("No SRS content")) {
      throw error; // Re-throw as-is
    }
    
    throw new Error(`Feature extraction failed: ${error.message || error}`);
  }
}


