/**
 * Retrieval Layer - Section Grouping and Coverage (Canonical Implementation)
 *
 * Used by:
 *  - legacy: ../ragService/sections.js (re-exports)
 *  - new: ./sectionsCore.js or ./retrievalStrategies.js
 */

import { extractSectionNumbers } from "../../utils/textProcessing.js";

export function groupChunksBySections(chunks) {
  const sectionsMap = {};
  const ungrouped = [];

  for (const chunk of chunks) {
    // Extract section numbers from chunk text and metadata
    const sectionNumbers = extractSectionNumbers(chunk.text);

    // Also check metadata for section info
    if (chunk.metadata?.sectionId) {
      sectionNumbers.push(chunk.metadata.sectionId);
    }

    if (sectionNumbers.length > 0) {
      // Group by first (most specific) section number
      const primarySection = sectionNumbers[0];
      if (!sectionsMap[primarySection]) {
        sectionsMap[primarySection] = {
          sectionId: primarySection,
          chunks: [],
          allSections: new Set(),
        };
      }
      sectionsMap[primarySection].chunks.push(chunk);
      sectionNumbers.forEach((sec) =>
        sectionsMap[primarySection].allSections.add(sec)
      );
    } else {
      ungrouped.push(chunk);
    }
  }

  // Convert Sets to Arrays
  Object.values(sectionsMap).forEach((section) => {
    section.allSections = Array.from(section.allSections);
  });

  return {
    bySection: sectionsMap,
    ungrouped,
    sectionCount: Object.keys(sectionsMap).length,
    totalChunks: chunks.length,
  };
}

export function analyzeSectionCoverage(features, groupedChunks) {
  // Extract all section numbers from features
  const featureSections = new Set();
  features.forEach((feature) => {
    if (feature.matchedSections && Array.isArray(feature.matchedSections)) {
      feature.matchedSections.forEach((sec) => featureSections.add(sec));
    }
  });

  // Get all sections from chunks
  const chunkSections = new Set(Object.keys(groupedChunks.bySection));

  // Calculate coverage
  const coveredSections = Array.from(featureSections);
  const allSections = Array.from(
    new Set([...featureSections, ...chunkSections])
  );
  const coveragePercentage =
    allSections.length > 0
      ? (coveredSections.length / allSections.length) * 100
      : 0;

  // Find missing sections (sections in chunks but not in features)
  const missingSections = Array.from(chunkSections).filter(
    (sec) => !featureSections.has(sec)
  );

  return {
    totalSections: allSections.length,
    coveredSections: coveredSections.length,
    missingSections: missingSections.length,
    coveragePercentage: Math.round(coveragePercentage * 100) / 100,
    coveredSectionList: coveredSections.sort(),
    missingSectionList: missingSections.sort(),
    recommendations:
      missingSections.length > 0
        ? `Consider reviewing sections: ${missingSections
            .slice(0, 5)
            .join(", ")}${
            missingSections.length > 5 ? "..." : ""
          }`
        : "All detected sections have been covered",
  };
}


