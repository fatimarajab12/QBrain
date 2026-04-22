/**
 * Document Processing Validator
 * 
 * Validates and displays results after Document AI processing
 */

import { parsePDFWithDocumentAI } from "../ai/ingestion/documentParser.js";
import fs from "fs";


export function validateDocumentProcessing(filePath, parseResult) {
  console.log("\n" + "=".repeat(70));
  console.log("DOCUMENT PROCESSING VALIDATION");
  console.log("=".repeat(70));

  // File information
  if (fs.existsSync(filePath)) {
    const fileStats = fs.statSync(filePath);
    console.log("\nFile Information:");
    console.log("   " + "-".repeat(50));
    console.log(`   File: ${filePath.split(/[/\\]/).pop()}`);
    console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB`);
  }

  // Document AI Results
  console.log("\nDocument AI Processing Results:");
  console.log("   " + "-".repeat(50));
  console.log(`   Pages: ${parseResult.pages || 0}`);
  console.log(`   Text Length: ${parseResult.text?.length || 0} characters`);
  console.log(`   Tables Count: ${parseResult.tables?.length || 0}`);
  console.log(`   Forms Count: ${parseResult.forms?.length || 0}`);
  console.log(`   Confidence: ${parseResult.confidence || "N/A"}`);
  console.log(`   Processor: ${parseResult.metadata?.processor || "N/A"}`);

  // Text Validation
  console.log("\nText Extraction Validation:");
  const textLength = parseResult.text?.length || 0;
  if (textLength > 0) {
    console.log(`   Text extracted successfully (${textLength} chars)`);
    console.log(`   Preview (first 200 chars):`);
    const preview = parseResult.text.substring(0, 200);
    console.log(`   "${preview}${textLength > 200 ? "..." : ""}"`);
  } else {
    console.log("   WARNING: No text extracted!");
  }

  // Tables Validation
  if (parseResult.tables && parseResult.tables.length > 0) {
    console.log("\nTables Extraction Validation:");
    console.log(`   ${parseResult.tables.length} table(s) extracted`);
    parseResult.tables.forEach((table, index) => {
      console.log(`\n   Table ${index + 1} (Page ${table.page || "N/A"}):`);
      console.log(`      Rows: ${table.rows?.length || 0}`);
      if (table.rows && table.rows.length > 0) {
        console.log(`      Preview (first 2 rows):`);
        table.rows.slice(0, 2).forEach((row, rowIndex) => {
          console.log(`      Row ${rowIndex + 1}: ${row.join(" | ")}`);
        });
        if (table.rows.length > 2) {
          console.log(`      ... (${table.rows.length - 2} more rows)`);
        }
      }
    });
  }

  // Forms Validation
  if (parseResult.forms && parseResult.forms.length > 0) {
    console.log("\nForms Extraction Validation:");
    console.log(`    ${parseResult.forms.length} form field(s) extracted`);
    parseResult.forms.slice(0, 3).forEach((form, index) => {
      console.log(`   ${index + 1}. ${form.type}: ${form.value?.substring(0, 50) || ""}${form.value?.length > 50 ? "..." : ""} (confidence: ${((form.confidence || 0) * 100).toFixed(1)}%)`);
    });
    if (parseResult.forms.length > 3) {
      console.log(`   ... (${parseResult.forms.length - 3} more forms)`);
    }
  }

  // Return validation results
  return {
    success: textLength > 0,
    textLength,
    tablesCount: parseResult.tables?.length || 0,
    formsCount: parseResult.forms?.length || 0,
    pages: parseResult.pages || 0,
    confidence: parseResult.confidence,
  };
}

