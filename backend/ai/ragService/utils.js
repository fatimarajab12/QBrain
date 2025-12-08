/**
 * Utility Functions for RAG Service
 */

/**
 * Cleans the raw LLM output and extracts only the JSON portion — removing:
 * - Markdown code blocks
 * - Extra whitespace
 * - Random text the LLM may add
 */
export function extractJSON(text) {
  if (!text || typeof text !== "string") return text;

  let cleaned = text.trim();

  // Remove markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = cleaned.match(codeBlockRegex);

  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  // Find the first [ or { and extract the complete JSON structure
  const firstBracket = cleaned.search(/[\[\{]/);
  
  if (firstBracket !== -1) {
    // Find the matching closing bracket
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    let lastValidIndex = -1;
    const startChar = cleaned[firstBracket];
    const endChar = startChar === '[' ? ']' : '}';
    
    for (let i = firstBracket; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === startChar) {
        bracketCount++;
      } else if (char === endChar) {
        bracketCount--;
        if (bracketCount === 0) {
          lastValidIndex = i;
          break;
        }
      }
    }
    
    if (lastValidIndex !== -1) {
      cleaned = cleaned.substring(firstBracket, lastValidIndex + 1);
    } else {
      // If we can't find matching bracket, try to extract what we can
      // Look for the last ] or } in the string
      const lastBracketIndex = Math.max(
        cleaned.lastIndexOf(']'),
        cleaned.lastIndexOf('}')
      );
      if (lastBracketIndex > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracketIndex + 1);
      }
    }
  }

  return cleaned.trim();
}

/**
 * Fixes common JSON issues in LLM responses
 */
function fixJSONIssues(jsonString) {
  let fixed = jsonString;
  
  // Remove comments (JSON doesn't support comments)
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');
  fixed = fixed.replace(/\/\/.*$/gm, '');
  
  // Fix trailing commas before closing brackets/braces
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
  // Try to fix unescaped newlines and quotes in string values
  // This is complex, so we'll do it carefully
  let result = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < fixed.length; i++) {
    const char = fixed[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      // Inside a string - escape problematic characters
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}

/**
 * Safely parses JSON from LLM response with multiple fallback strategies
 */
export function parseJSONSafely(text, retries = 2) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  let cleaned = extractJSON(text);
  
  // Try parsing directly first
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      if (attempt === retries) {
        // Last attempt - try to fix common issues
        try {
          const fixed = fixJSONIssues(cleaned);
          return JSON.parse(fixed);
        } catch (fixError) {
          // Log more details for debugging
          const preview = cleaned.substring(0, 500);
          const errorPosition = error.message.match(/position (\d+)/);
          if (errorPosition) {
            const pos = parseInt(errorPosition[1]);
            const start = Math.max(0, pos - 100);
            const end = Math.min(cleaned.length, pos + 100);
            console.error("JSON parsing error at position", pos);
            console.error("Context around error:", cleaned.substring(start, end));
          }
          console.error("JSON parsing error. Original text preview:", preview);
          console.error("Full error:", error.message);
          throw new Error(`Invalid JSON response: ${error.message}. Preview: ${preview.substring(0, 200)}`);
        }
      }
      
      // Try to extract just the array/object part more aggressively
      if (attempt < retries) {
        // Try to find and extract just the JSON array/object
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        const objectMatch = cleaned.match(/\{[\s\S]*\}/);
        
        if (arrayMatch) {
          cleaned = arrayMatch[0];
        } else if (objectMatch) {
          cleaned = objectMatch[0];
        }
      }
    }
  }
}

