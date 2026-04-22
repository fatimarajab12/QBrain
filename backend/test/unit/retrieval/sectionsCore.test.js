import { describe, expect, it } from "@jest/globals";

import {
  analyzeSectionCoverage,
  groupChunksBySections,
} from "../../../ai/retrieval/sectionsCore.js";
import { mockChunks } from "../fixtures/index.js";

describe("sectionsCore", () => {
  it("groupChunksBySections groups by section numbers in text/metadata", () => {
    const grouped = groupChunksBySections(mockChunks);

    expect(grouped.totalChunks).toBe(mockChunks.length);
    expect(grouped.sectionCount).toBeGreaterThanOrEqual(1);
    expect(grouped.bySection["3.2"]).toBeDefined();
    expect(grouped.bySection["3.2"].chunks.length).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(grouped.ungrouped)).toBe(true);
    // One chunk intentionally has no detectable section number -> ungrouped
    expect(grouped.ungrouped.length).toBe(1);
    // Metadata-only sectionId should also be grouped
    expect(grouped.bySection["3.3"]).toBeDefined();
  });

  it("analyzeSectionCoverage reports missing sections", () => {
    const grouped = groupChunksBySections(mockChunks);
    const features = [
      { matchedSections: ["3.2"] },
      { matchedSections: ["999.1"] }, // not present in chunks
    ];

    const coverage = analyzeSectionCoverage(features, grouped);

    expect(coverage.totalSections).toBeGreaterThan(0);
    expect(coverage.coveredSectionList).toEqual(
      expect.arrayContaining(["3.2", "999.1"])
    );
    expect(Array.isArray(coverage.missingSectionList)).toBe(true);
  });
});


