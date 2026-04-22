import { describe, expect, it } from "@jest/globals";

import {
  cleanText,
  createSemanticHash,
  enrichSectionText,
  extractSectionNumbers,
  extractKeywords,
  boostTitle,
  normalizeVector,
} from "../../../utils/textProcessing.js";

describe("textProcessing", () => {
  it("cleanText collapses whitespace", () => {
    expect(cleanText(" Hello \n\n world \t\t !!  ")).toBe("Hello world !!");
  });

  it("cleanText returns empty string for non-string inputs", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
    expect(cleanText(123)).toBe("");
    expect(cleanText({})).toBe("");
  });

  it("extractSectionNumbers finds nested section numbers", () => {
    expect(
      extractSectionNumbers("See sections 3.2.1 and 4.1.2.3; also 10.4")
    ).toEqual(expect.arrayContaining(["3.2.1", "4.1.2.3", "10.4"]));
  });

  it("extractSectionNumbers returns [] for invalid inputs", () => {
    expect(extractSectionNumbers(null)).toEqual([]);
    expect(extractSectionNumbers(undefined)).toEqual([]);
    expect(extractSectionNumbers(123)).toEqual([]);
  });

  it("extractKeywords extracts top keywords by frequency (filters stop words & short words)", () => {
    const text =
      "The system shall process payment payment invoice invoice invoice and notify user user user.";
    const keywords = extractKeywords(text, 5);

    expect(keywords.length).toBeLessThanOrEqual(5);
    // Most frequent should appear
    expect(keywords).toEqual(expect.arrayContaining(["invoice", "payment"]));
    // stop words shouldn't appear
    expect(keywords).not.toEqual(expect.arrayContaining(["the", "and"]));
  });

  it("extractKeywords returns [] for invalid inputs", () => {
    expect(extractKeywords(null)).toEqual([]);
    expect(extractKeywords(undefined)).toEqual([]);
    expect(extractKeywords(123)).toEqual([]);
  });

  it("createSemanticHash normalizes and truncates to 50 chars", () => {
    const hash = createSemanticHash("  Hello   World!   \nNew line  ");
    expect(hash).toBe("helloworld!newline".replace(/\s+/g, ""));
    expect(hash.length).toBeLessThanOrEqual(50);
  });

  it("createSemanticHash returns empty string for invalid inputs", () => {
    expect(createSemanticHash(null)).toBe("");
    expect(createSemanticHash(undefined)).toBe("");
    expect(createSemanticHash(123)).toBe("");
  });

  it("boostTitle repeats title 3 times and preserves cleaned text", () => {
    const out = boostTitle("  My Title  ", "Body   text");
    expect(out.startsWith("My Title My Title My Title\n")).toBe(true);
    expect(out).toContain("Body text");
  });

  it("boostTitle returns original text if title or text missing", () => {
    expect(boostTitle("", "Hello")).toBe("Hello");
    expect(boostTitle("Title", "")).toBe("");
    expect(boostTitle(null, "Hello")).toBe("Hello");
  });

  it("enrichSectionText builds a section-style embedding and boosts title", () => {
    const out = enrichSectionText({
      sectionId: "3.2",
      title: "Login",
      content: "The system shall allow login.",
      level: 2,
    });

    // title boosted 3 times at top
    expect(out.startsWith("Login Login Login\n")).toBe(true);
    expect(out).toContain("SECTION: 3.2");
    expect(out).toContain("TITLE: Login");
    expect(out).toContain("CONTENT: The system shall allow login.");
  });

  it("normalizeVector normalizes vector magnitude to 1", () => {
    const out = normalizeVector([3, 4]);
    expect(out[0]).toBeCloseTo(0.6, 5);
    expect(out[1]).toBeCloseTo(0.8, 5);
  });
});


