/**
 * Reasoning - Feature Extraction from SRS using RAG
 *
 * Core implementation used by the RAG API and services.
 */

import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { detectSRSType } from "../retrieval/srsDetectionCore.js";
import {
  getRAGContext,
  getComprehensiveRAGContext,
} from "../retrieval/retrievalCore.js";
import {
  groupChunksBySections,
  analyzeSectionCoverage,
} from "../retrieval/sectionsCore.js";
import { createAdaptivePrompt } from "./prompts/index.js";
import { dedupeByKey, parseJSONSafely } from "./jsonUtils.js";

function classifyFeatureType(feature) {
  if (feature.featureType) return feature.featureType;

  const featureText = `${feature.name} ${feature.description}`.toLowerCase();

  if (
    featureText.includes("data") ||
    featureText.includes("field") ||
    featureText.includes("table") ||
    featureText.includes("dictionary")
  ) {
    return "DATA";
  } else if (
    featureText.includes("interface") ||
    featureText.includes("api") ||
    featureText.includes("ui") ||
    featureText.includes("user interface")
  ) {
    return "INTERFACE";
  } else if (
    featureText.includes("quality") ||
    featureText.includes("performance") ||
    featureText.includes("security") ||
    featureText.includes("usability")
  ) {
    return "QUALITY";
  } else if (
    featureText.includes("report") ||
    featureText.includes("document") ||
    featureText.includes("output")
  ) {
    return "REPORT";
  } else if (
    featureText.includes("constraint") ||
    featureText.includes("assumption") ||
    featureText.includes("dependency")
  ) {
    return "CONSTRAINT";
  } else if (
    featureText.includes("notification") ||
    featureText.includes("alert") ||
    featureText.includes("message")
  ) {
    return "NOTIFICATION";
  } else if (
    featureText.includes("workflow") ||
    featureText.includes("process") ||
    featureText.includes("procedure")
  ) {
    return "WORKFLOW";
  } else {
    return "FUNCTIONAL";
  }
}

function enhanceFeatures(features, contextChunks, groupedChunks) {
  return features.map((feature) => {
    const featureQuery = `${feature.name} ${feature.description}`;
    const matchingChunks = contextChunks.filter((chunk) => {
      const chunkText = chunk.text.toLowerCase();
      const featureText = featureQuery.toLowerCase();
      return (
        chunkText.includes(feature.name.toLowerCase()) ||
        featureText.includes(chunk.text.substring(0, 50).toLowerCase())
      );
    });

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

    const featureType = classifyFeatureType(feature);

    const relevanceScore =
      matchingChunks.length > 0
        ? matchingChunks.reduce((sum, chunk) => sum + chunk.relevance, 0) /
          matchingChunks.length
        : 0.5;

    const priorityScore =
      feature.priority === "High"
        ? 3
        : feature.priority === "Medium"
        ? 2
        : 1;

    const rankingScore =
      relevanceScore * 0.5 +
      (priorityScore / 3) * 0.3 +
      (feature.confidence || 0.7) * 0.2;

    return {
      ...feature,
      featureType,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      rankingScore: Math.round(rankingScore * 100) / 100,
      matchedChunksCount: matchingChunks.length,
      matchedSectionInfo,
      reasoning:
        feature.reasoning ||
        `This feature is explicitly stated in SRS section ${
          feature.matchedSections?.[0] || "unknown"
        }.`,
      matchedSections: feature.matchedSections || [],
      confidence: feature.confidence || 0.7,
    };
  });
}

function normalizeFeatureName(name) {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/g, "") // remove trailing "(1)", "(2)", ...
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
  const hasDataKeyword = /(id|name|number|code|date|amount|fee|status|address|email|mobile|phone|tariff)/i.test(
    name
  );
  const hasVerb = /\b(create|update|delete|view|manage|process|generate|send|notify|calculate)\b/i.test(
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
    /system must be (available|robust|scalable|secure|fast)/i.test(
      `${feature.description || ""}`
    ) ||
    /^availability$/i.test(feature.name || "") ||
    /^robustness$/i.test(feature.name || "") ||
    /^scalability$/i.test(feature.name || "");

  const hasConcreteNumbers =
    /\b\d+(\.\d+)?\s*(seconds?|ms|users?|requests?|%|percent|minutes?)\b/i.test(
      text
    );

  // Keep if there are concrete numeric targets, otherwise drop as too generic
  return hasVeryGenericPattern && !hasConcreteNumbers;
}

function looksLikeInfraOnly(feature) {
  const text = `${feature.name || ""} ${feature.description || ""}`.toLowerCase();
  if (!text) return false;

  // Obvious infra / internal-only items that aren't real user-facing features
  if (
    /database credentials|db credentials|hosting|server configuration|internal hosting|infrastructure/i.test(
      text
    )
  ) {
    return true;
  }

  return false;
}

function cleanAndDeduplicateFeatures(features) {
  const dataFieldNames = [];

  const filtered = [];

  for (const feature of features) {
    // Filter out raw data field "features"
    if (looksLikeSimpleDataField(feature)) {
      dataFieldNames.push(feature.name.trim());
      continue;
    }

    // Filter out too-generic QUALITY statements
    if (looksLikeGenericQualityStatement(feature)) {
      continue;
    }

    // Filter out infra-only items
    if (looksLikeInfraOnly(feature)) {
      continue;
    }

    filtered.push(feature);
  }

  // Deduplicate by normalized name
  const cleaned = dedupeByKey(filtered, (f) =>
    normalizeFeatureName(f.name || "")
  );

  // If there were many raw data fields, add one aggregated Data Model feature
  if (dataFieldNames.length >= 5) {
    cleaned.push({
      featureId: "data_model_001",
      name: "Customer & Service Data Model",
      description:
        "Logical data model that groups all customer, service, billing and status fields used by the system. " +
        "This replaces individual field features such as: " +
        dataFieldNames.slice(0, 15).join(", ") +
        (dataFieldNames.length > 15 ? ", ..." : ""),
      featureType: "DATA_MODEL",
      priority: "Medium",
      status: "pending",
      acceptanceCriteria: [],
      reasoning:
        "Grouped multiple low-level data fields into a single data model feature for better readability and testability.",
      matchedSections: [],
      confidence: 0.7,
    });
  }

  return cleaned;
}
export async function generateFeaturesFromRAG(projectId, options = {}) {
  try {
    const safeOptions = options && typeof options === "object" ? options : {};

    const {
      nContextChunks = 20,
      model = "gpt-4o-mini",
      useComprehensiveRetrieval = true,
      chunksPerQuery = 7,
    } = safeOptions;

    const srsType = await detectSRSType(projectId);
    console.log(`Using SRS type: ${srsType.name} for feature extraction`);

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

    let context;
    if (groupedChunks) {
      const sectionContexts = Object.values(groupedChunks.bySection).map(
        (section) =>
          `[Section ${section.sectionId}]\n${section.chunks
            .map((c) => c.text)
            .join("\n\n")}`
      );
      context = sectionContexts.join("\n\n---\n\n");
      if (groupedChunks.ungrouped.length > 0) {
        context +=
          "\n\n[Other Content]\n" +
          groupedChunks.ungrouped.map((c) => c.text).join("\n\n");
      }
    } else {
      context = contextChunks.map((chunk) => chunk.text).join("\n\n");
    }

    const llm = createChatModel({
      model,
      temperature: 0.7,
    });

    const adaptivePromptText = createAdaptivePrompt(srsType);

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
      `You are an SRS Feature Extractor. Your task is to extract features DIRECTLY from the SRS text below.

${adaptivePromptText}
${contextStats}

SRS Text:
{context}

**CRITICAL INSTRUCTIONS FOR COMPLETE COVERAGE:**
1. Read the ENTIRE SRS text carefully - do not skip any section or paragraph
2. Extract EVERY feature, requirement, and capability mentioned - NO EXCEPTIONS
3. Go through each section systematically and extract all features from it
4. Count how many features you extract and ensure you didn't miss any
5. If the SRS has many sections, extract features from ALL sections
6. Pay special attention to brief requirements, constraints, and quality attributes
7. Return a COMPLETE JSON array with ALL features found - completeness is more important than speed

Extract all features from the SRS text above. Return JSON array:`
    );

    const formattedPrompt = await prompt.format({ context });
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);
    const features = Array.isArray(parsed) ? parsed : parsed.features || [];

    const enhancedFeatures = enhanceFeatures(
      features,
      contextChunks,
      groupedChunks
    );
    let cleanedFeatures = cleanAndDeduplicateFeatures(enhancedFeatures);
    cleanedFeatures.sort((a, b) => b.rankingScore - a.rankingScore);

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
          srsType: srsType.name,
          srsTypeConfidence: srsType.confidence,
          totalFeatures: cleanedFeatures.length,
          featuresByType: Object.entries(
            cleanedFeatures.reduce((acc, f) => {
              const type = f.featureType || "FUNCTIONAL";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count })),
          ...(coverageAnalysis && { coverage: coverageAnalysis }),
        },
      };
    }

    return cleanedFeatures;
  } catch (error) {
    console.error("Error generating features from RAG:", error);
    throw error;
  }
}


