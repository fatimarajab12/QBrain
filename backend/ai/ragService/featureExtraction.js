/**
 * Feature Extraction Module - Handles feature extraction from SRS
 */

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { detectSRSType } from "./srsDetection.js";
import { getRAGContext, getComprehensiveRAGContext } from "./retrieval.js";
import { groupChunksBySections, analyzeSectionCoverage } from "./sections.js";
import { createAdaptivePrompt } from "./prompts.js";
import { parseJSONSafely } from "./utils.js";

/**
 * Helper function to auto-classify feature type
 */
function classifyFeatureType(feature) {
  if (feature.featureType) return feature.featureType;
  
  const featureText = `${feature.name} ${feature.description}`.toLowerCase();
  
  if (featureText.includes('data') || featureText.includes('field') || featureText.includes('table') || featureText.includes('dictionary')) {
    return 'DATA';
  } else if (featureText.includes('interface') || featureText.includes('api') || featureText.includes('ui') || featureText.includes('user interface')) {
    return 'INTERFACE';
  } else if (featureText.includes('quality') || featureText.includes('performance') || featureText.includes('security') || featureText.includes('usability')) {
    return 'QUALITY';
  } else if (featureText.includes('report') || featureText.includes('document') || featureText.includes('output')) {
    return 'REPORT';
  } else if (featureText.includes('constraint') || featureText.includes('assumption') || featureText.includes('dependency')) {
    return 'CONSTRAINT';
  } else if (featureText.includes('notification') || featureText.includes('alert') || featureText.includes('message')) {
    return 'NOTIFICATION';
  } else if (featureText.includes('workflow') || featureText.includes('process') || featureText.includes('procedure')) {
    return 'WORKFLOW';
  } else {
    return 'FUNCTIONAL'; // Default
  }
}

/**
 * Enhances features with metadata and scores
 */
function enhanceFeatures(features, contextChunks, groupedChunks) {
  return features.map((feature) => {
    // Find matching context chunks
    const featureQuery = `${feature.name} ${feature.description}`;
    const matchingChunks = contextChunks.filter(chunk => {
      const chunkText = chunk.text.toLowerCase();
      const featureText = featureQuery.toLowerCase();
      return chunkText.includes(feature.name.toLowerCase()) || 
             featureText.includes(chunk.text.substring(0, 50).toLowerCase());
    });

    // Find matching section if grouped chunks available
    let matchedSectionInfo = null;
    if (groupedChunks && feature.matchedSections && feature.matchedSections.length > 0) {
      const primarySection = feature.matchedSections[0];
      if (groupedChunks.bySection[primarySection]) {
        matchedSectionInfo = {
          sectionId: primarySection,
          chunksCount: groupedChunks.bySection[primarySection].chunks.length,
          ...(groupedChunks.bySection[primarySection].allSections && {
            allSections: groupedChunks.bySection[primarySection].allSections
          })
        };
      }
    }

    // Auto-classify feature type
    const featureType = classifyFeatureType(feature);

    // Calculate relevance score
    const relevanceScore = matchingChunks.length > 0
      ? matchingChunks.reduce((sum, chunk) => sum + chunk.relevance, 0) / matchingChunks.length
      : 0.5;

    // Calculate priority score (High=3, Medium=2, Low=1)
    const priorityScore = feature.priority === 'High' ? 3 : 
                         feature.priority === 'Medium' ? 2 : 1;

    // Calculate ranking score
    const rankingScore = (
      (relevanceScore * 0.5) +           // 50% weight on relevance
      (priorityScore / 3 * 0.3) +        // 30% weight on priority
      ((feature.confidence || 0.7) * 0.2) // 20% weight on confidence
    );

    return {
      ...feature,
      featureType: featureType,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      rankingScore: Math.round(rankingScore * 100) / 100,
      matchedChunksCount: matchingChunks.length,
      matchedSectionInfo: matchedSectionInfo,
      reasoning: feature.reasoning || `This feature is explicitly stated in SRS section ${feature.matchedSections?.[0] || 'unknown'}.`,
      matchedSections: feature.matchedSections || [],
      confidence: feature.confidence || 0.7,
    };
  });
}

/**
 * Generates features from RAG (with backward compatibility)
 */
export async function generateFeaturesFromRAG(projectId, options = {}) {
  try {
    const safeOptions = options && typeof options === 'object' ? options : {};
    

    const { 
      nContextChunks = 20, 
      model = "gpt-4o-mini",  // Using gpt-4o-mini for cost efficiency
      useComprehensiveRetrieval = true,  // Enabled by default for better coverage
      chunksPerQuery = 7                 // Increased from 5 to 7 for better context per query
    } = safeOptions;

    const srsType = await detectSRSType(projectId);
    console.log(`Using SRS type: ${srsType.name} for feature extraction`);

    
    let contextChunks;
    let groupedChunks = null;
    /**
     * Context Retrieval Strategy 
     * useComprehensiveRetrieval becomes true when:
     * 1. Explicitly passed in options: { useComprehensiveRetrieval: true }
     * 2. Called from testCaseService.js (defaults to true for test case generation)
     * 
     * When false (Simple Retrieval - DEFAULT):
     * - Uses single query: "requirements features specifications"
     * - Retrieves nContextChunks (default: 10) chunks
     * - Faster and more cost-effective
     * - Suitable for smaller SRS documents or quick feature extraction
     * 
     */
    if (useComprehensiveRetrieval) {
      const comprehensiveResult = await getComprehensiveRAGContext(projectId, chunksPerQuery);
      contextChunks = comprehensiveResult.chunks;
      
      // Group chunks by sections
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

    // Organize context by sections if available
    let context;
    if (groupedChunks) {
      const sectionContexts = Object.values(groupedChunks.bySection).map(section => 
        `[Section ${section.sectionId}]\n${section.chunks.map(c => c.text).join("\n\n")}`
      );
      context = sectionContexts.join("\n\n---\n\n");
      if (groupedChunks.ungrouped.length > 0) {
        context += "\n\n[Other Content]\n" + groupedChunks.ungrouped.map(c => c.text).join("\n\n");
      }
    } else {
      context = contextChunks.map((chunk) => chunk.text).join("\n\n");
    }

    const llm = new ChatOpenAI({
      model: model,
      temperature: 0.7,  // Balanced temperature for consistent extraction
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create adaptive prompt based on SRS type
    const adaptivePromptText = createAdaptivePrompt(srsType);
    
    // Add context statistics to help LLM understand scope
    const contextStats = groupedChunks 
      ? `\n**Context Statistics:**\n- Total sections in context: ${groupedChunks.sectionCount}\n- Total chunks retrieved: ${contextChunks.length}\n- This means you have comprehensive coverage of the SRS document.\n`
      : `\n**Context Statistics:**\n- Total chunks retrieved: ${contextChunks.length}\n- Make sure to extract features from ALL chunks provided.\n`;
    
    const prompt = PromptTemplate.fromTemplate(`You are an SRS Feature Extractor. Your task is to extract features DIRECTLY from the SRS text below.

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

Extract all features from the SRS text above. Return JSON array:`);

    const formattedPrompt = await prompt.format({ context });
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);
    const features = Array.isArray(parsed) ? parsed : parsed.features || [];

    // Enhance features
    const enhancedFeatures = enhanceFeatures(features, contextChunks, groupedChunks);
    enhancedFeatures.sort((a, b) => b.rankingScore - a.rankingScore);

    let coverageAnalysis = null;
    if (groupedChunks) {
      coverageAnalysis = analyzeSectionCoverage(enhancedFeatures, groupedChunks);
      console.log(`Section coverage: ${coverageAnalysis.coveragePercentage.toFixed(1)}% (${coverageAnalysis.coveredSections}/${coverageAnalysis.totalSections} sections)`);
    }

    // Return enhanced result with coverage analysis
    // For backward compatibility: if useComprehensiveRetrieval is false, return array
    if (useComprehensiveRetrieval) {
      const resultObj = {
        features: enhancedFeatures,
        metadata: {
          srsType: srsType.name,
          srsTypeConfidence: srsType.confidence,
          totalFeatures: enhancedFeatures.length,
          featuresByType: Object.entries(
            enhancedFeatures.reduce((acc, f) => {
              const type = f.featureType || 'FUNCTIONAL';
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => ({ type, count })),
          ...(coverageAnalysis && { coverage: coverageAnalysis })
        }
      };
      return resultObj;
    }
    
    // Backward compatibility: return array of features
    return enhancedFeatures;
  } catch (error) {
    console.error("Error generating features from RAG:", error);
    throw error;
  }
}

