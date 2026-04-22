import { describe, expect, it } from "@jest/globals";

import { extractJSON, parseJSONSafely } from "../../../ai/reasoning/jsonUtils.js";
import { llmJsonTexts } from "../fixtures/index.js";

describe("jsonUtils", () => {
  describe("extractJSON", () => {
    it("extracts JSON from a ```json code block", () => {
      expect(extractJSON(llmJsonTexts.codeBlock)).toBe('{ "a": 1 }');
    });

    it("extracts the first JSON object inside a noisy string", () => {
      expect(extractJSON(llmJsonTexts.withIntro)).toBe('{ "a": 1, "b": 2 }');
    });
  });

  describe("parseJSONSafely", () => {
    it("parses a clean JSON object", () => {
      expect(parseJSONSafely('{ "a": 1 }')).toEqual({ a: 1 });
    });

    it("repairs a trailing comma and parses", () => {
      expect(parseJSONSafely(llmJsonTexts.trailingComma)).toEqual({ a: 1 });
    });

    it("parses JSON that includes a raw newline inside a string (best-effort fix)", () => {
      expect(parseJSONSafely(llmJsonTexts.badNewlinesInString)).toEqual({
        msg: "line1\nline2",
      });
    });
  });
});


