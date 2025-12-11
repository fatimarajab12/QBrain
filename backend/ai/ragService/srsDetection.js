/**
 * SRS Type Detection Module - Enhanced for better accuracy
 */

import { getRAGContext } from "./retrieval.js";
import { SRS_TYPE_PATTERNS } from "./constants.js";


export async function detectSRSType(projectId) {
  try {
    // Get more comprehensive context for better detection (increased from 10 to 20 chunks)
    const sampleChunks = await getRAGContext(projectId, "requirements specification document structure format", 20);
    
    if (!sampleChunks || sampleChunks.length === 0) {
      throw new Error("No SRS content found for type detection");
    }

    const combinedText = sampleChunks.map(chunk => chunk.text).join("\n\n");
    const textLower = combinedText.toLowerCase();
    const textOriginal = combinedText; // Keep original for regex patterns

    const scores = {};
    
    /**
     * Enhanced scoring algorithm:
     * 1. Count keyword occurrences (not just presence)
     * 2. Check structural patterns (regex)
     * 3. Weighted scoring: keywords 70%, structural 30%
     */
    for (const [type, pattern] of Object.entries(SRS_TYPE_PATTERNS)) {
      let keywordScore = 0;
      let structuralScore = 0;
      
      // Count keyword matches (count occurrences, not just presence)
      for (const keyword of pattern.keywords) {
        const keywordLower = keyword.toLowerCase();
        // Escape special regex characters and count all occurrences
        const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matches = (textLower.match(new RegExp(escapedKeyword, 'g')) || []).length;
        keywordScore += matches;
      }
      
      // Check structural patterns (regex)
      if (pattern.structuralPatterns && pattern.structuralPatterns.length > 0) {
        for (const regexPattern of pattern.structuralPatterns) {
          const matches = textOriginal.match(regexPattern);
          if (matches) {
            structuralScore += matches.length;
          }
        }
      }
      
      // Calculate weighted total score
      // Keywords: 70% weight, Structural: 30% weight
      const keywordWeight = 0.7;
      const structuralWeight = 0.3;
      
      // Normalize keyword score (divide by number of keywords to get average)
      const normalizedKeywordScore = pattern.keywords.length > 0 
        ? (keywordScore / pattern.keywords.length) * keywordWeight
        : 0;
      
      // Normalize structural score (divide by number of patterns)
      const normalizedStructuralScore = pattern.structuralPatterns && pattern.structuralPatterns.length > 0
        ? (structuralScore / pattern.structuralPatterns.length) * structuralWeight
        : 0;
      
      const totalScore = normalizedKeywordScore + normalizedStructuralScore;
      
      // Calculate percentage (scale to 0-100)
      const maxPossibleScore = keywordWeight + structuralWeight; // 1.0
      const percentage = (totalScore / maxPossibleScore) * 100;
      
      scores[type] = {
        keywordScore,
        structuralScore,
        totalScore,
        percentage: Math.min(Math.round(percentage * 10) / 10, 100), // Round to 1 decimal
        pattern
      };
    }

    // Find the type with highest score
    const sortedTypes = Object.entries(scores).sort((a, b) => b[1].totalScore - a[1].totalScore);
    const detectedType = sortedTypes[0][0];
    
    // Calculate confidence with boost for clear winner
    let confidence = scores[detectedType].percentage;
    
    if (sortedTypes.length > 1) {
      const secondBestScore = sortedTypes[1][1].totalScore;
      const scoreDifference = scores[detectedType].totalScore - secondBestScore;
      
      if (scoreDifference > 0.2) {
        confidence = Math.min(confidence + 15, 95);
      } else if (scoreDifference < 0.1) {
        // Close scores - reduce confidence
        confidence = Math.max(confidence - 10, 40);
      }
    }
    
    // Ensure minimum confidence threshold
    if (confidence < 40) {
      console.warn(`Low confidence (${confidence.toFixed(1)}%), but proceeding with detection`);
    }

    const result = {
      type: detectedType,
      name: SRS_TYPE_PATTERNS[detectedType].name,
      description: SRS_TYPE_PATTERNS[detectedType].description,
      confidence: Math.min(Math.round(confidence), 100),
      scores: Object.fromEntries(
        Object.entries(scores).map(([type, score]) => [
          type,
          {
            percentage: score.percentage,
            keywordMatches: score.keywordScore,
            structuralMatches: score.structuralScore
          }
        ])
      )
    };

    console.log(`Detected SRS type: ${result.name} (confidence: ${result.confidence}%)`);
    console.log(`Score breakdown:`, result.scores);
    
    return result;
  } catch (error) {
    console.error("Error detecting SRS type:", error);
    // Default to IEEE 830 if detection fails
    return {
      type: "IEEE_830",
      name: "IEEE 830",
      description: "Standard IEEE 830 SRS format",
      confidence: 50,
      scores: {}
    };
  }
}

