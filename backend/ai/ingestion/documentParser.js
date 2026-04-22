import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";

let client = null;

function getDocumentAIClient() {
  if (!client) {
    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_KEY_FILE) {
      throw new Error("Document AI is not configured. GCP_PROJECT_ID and GCP_KEY_FILE must be set in .env");
    }
    
    if (!fs.existsSync(process.env.GCP_KEY_FILE)) {
      throw new Error(`GCP key file not found: ${process.env.GCP_KEY_FILE}`);
    }
    
    client = new DocumentProcessorServiceClient({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GCP_KEY_FILE,
    });
  }
  return client;
}

const LOCATION = process.env.DOCUMENT_AI_LOCATION || "us";
const PROJECT_ID = process.env.GCP_PROJECT_ID;

export async function parsePDFWithDocumentAI(filePath) {
  try {
    // Check if a custom processor ID is provided
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!processorId) {
      throw new Error(
        "Document AI Processor ID not found. Please create a processor in Google Cloud Console " +
          "or set DOCUMENT_AI_PROCESSOR_ID in .env file. " +
          "You can create one at: https://console.cloud.google.com/ai/document-ai/processors"
      );
    }

    console.log(`Splitting and processing PDF: ${filePath}`);
    try {
      return await parsePDFWithSplitting(filePath);
    } catch (splitError) {
      console.warn(
        `PDF splitting failed: ${splitError.message}. Falling back to pdf-parse.`
      );
      return await parsePDFWithFallback(filePath);
    }
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    throw error;
  }
}

async function parsePDFWithFallback(filePath) {
  try {
    console.log(`Parsing PDF with pdf-parse fallback: ${filePath}`);

    const testDataDir = path.join(process.cwd(), "test", "data");
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }

    let pdfParse;
    try {
      const pdfParseModule = await import("pdf-parse");
      pdfParse = pdfParseModule.default || pdfParseModule;
    } catch (importError) {
      console.warn("pdf-parse import failed, trying alternative method");
      pdfParse = require("pdf-parse");
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const estimatedPages = Math.max(1, Math.ceil(data.text.length / 2500));

    console.log(
      `PDF parsed successfully with pdf-parse fallback. Text length: ${
        data.text.length
      } characters, ` + `Estimated pages: ${estimatedPages}`
    );

    return {
      text: data.text.trim(),
      tables: [], // pdf-parse doesn't extract tables
      forms: [], // pdf-parse doesn't extract forms
      pages: estimatedPages,
      confidence: "SUCCESS_FALLBACK",
      metadata: {
        processor: "pdf-parse",
        mimeType: "application/pdf",
        note: "Used pdf-parse fallback due to Document AI page limit",
      },
    };
  } catch (error) {
    console.error("pdf-parse fallback error:", error.message);
    throw new Error(
      `Failed to parse PDF with both Document AI and pdf-parse: ${error.message}`
    );
  }
}

async function processPDFChunk(filePath) {
  try {
    const imageFile = fs.readFileSync(filePath);
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
    const processorName = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${processorId}`;

    const request = {
      name: processorName,
      rawDocument: {
        content: imageFile,
        mimeType: "application/pdf",
      },
    };

    const [result] = await client.processDocument(request);
    const document = result.document;
    const text = document.text || "";

    // Extract tables
    const tables = [];
    if (document.pages && document.pages.length > 0) {
      document.pages.forEach((page, pageIndex) => {
        if (page.tables && page.tables.length > 0) {
          page.tables.forEach((table) => {
            const tableData = {
              page: pageIndex + 1,
              rows: [],
            };

            if (table.bodyRows && table.bodyRows.length > 0) {
              table.bodyRows.forEach((row) => {
                const rowData = [];
                if (row.cells && row.cells.length > 0) {
                  row.cells.forEach((cell) => {
                    const cellText =
                      cell.layout?.textAnchor?.textSegments
                        ?.map((segment) => {
                          const startIndex = segment.startIndex || 0;
                          const endIndex = segment.endIndex || 0;
                          return (
                            document.text?.substring(startIndex, endIndex) || ""
                          );
                        })
                        .join(" ") || "";
                    rowData.push(cellText.trim());
                  });
                }
                if (rowData.length > 0) {
                  tableData.rows.push(rowData);
                }
              });
            }

            if (tableData.rows.length > 0) {
              tables.push(tableData);
            }
          });
        }
      });
    }

    // Extract forms
    const forms = [];
    if (document.entities && document.entities.length > 0) {
      document.entities.forEach((entity) => {
        const entityText =
          entity.textAnchor?.textSegments
            ?.map((segment) => {
              const startIndex = segment.startIndex || 0;
              const endIndex = segment.endIndex || 0;
              return (
                document.text?.substring(startIndex, endIndex) || ""
              );
            })
            .join(" ") || "";

        forms.push({
          type: entity.type || "unknown",
          value: entityText.trim(),
          confidence: entity.confidence || 0,
        });
      });
    }

    return {
      text: text.trim(),
      tables,
      forms,
      pages: document.pages?.length || 0,
    };
  } catch (error) {
    throw error;
  }
}

async function parsePDFWithSplitting(filePath, maxPagesPerChunk = 15) {
  try {
    console.log(
      `Splitting PDF into chunks (max ${maxPagesPerChunk} pages per chunk): ${filePath}`
    );

    // Read the original PDF
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    console.log(`PDF has ${totalPages} pages. Splitting into chunks...`);

    const chunks = [];
    const tempFiles = [];

    try {
      // Split PDF into chunks
      for (let startPage = 0; startPage < totalPages; startPage += maxPagesPerChunk) {
        const endPage = Math.min(startPage + maxPagesPerChunk, totalPages);
        const chunkPages = endPage - startPage;

        console.log(
          `Creating chunk: pages ${startPage + 1} to ${endPage} (${chunkPages} pages)`
        );

        // Create a new PDF document for this chunk
        const chunkDoc = await PDFDocument.create();
        const pages = await chunkDoc.copyPages(
          pdfDoc,
          Array.from({ length: chunkPages }, (_, i) => startPage + i)
        );

        pages.forEach((page) => chunkDoc.addPage(page));

        // Save chunk to temporary file
        const chunkBytes = await chunkDoc.save();
        const tempFilePath = path.join(
          path.dirname(filePath),
          `temp-chunk-${startPage}-${endPage}-${Date.now()}.pdf`
        );
        fs.writeFileSync(tempFilePath, chunkBytes);
        tempFiles.push(tempFilePath);

        chunks.push({
          filePath: tempFilePath,
          startPage: startPage + 1,
          endPage: endPage,
          pageCount: chunkPages,
        });
      }

      console.log(
        `Split PDF into ${chunks.length} chunks. Processing each chunk with Document AI...`
      );

      // Process each chunk with Document AI
      const results = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `Processing chunk ${i + 1}/${chunks.length}: pages ${chunk.startPage}-${chunk.endPage}`
        );

        // Process chunk directly with Document AI only (no fallback to pdf-parse)
        // Since chunks are ≤ 30 pages, Document AI should work
        const chunkResult = await processPDFChunk(chunk.filePath);
        results.push({
          ...chunkResult,
          startPage: chunk.startPage,
          endPage: chunk.endPage,
        });
      }

      // Merge results
      console.log(`Merging results from ${results.length} chunks...`);
      const mergedText = results.map((r) => r.text).join("\n\n");
      const mergedTables = results.flatMap((r) =>
        (r.tables || []).map((table) => ({
          ...table,
          page: table.page + (r.startPage - 1), // Adjust page numbers
        }))
      );
      const mergedForms = results.flatMap((r) => r.forms || []);
      const totalPagesProcessed = results.reduce(
        (sum, r) => sum + (r.pages || 0),
        0
      );

      console.log(
        `Merged results: ${totalPagesProcessed} pages, ` +
          `${mergedText.length} characters, ${mergedTables.length} tables, ${mergedForms.length} forms`
      );

      return {
        text: mergedText.trim(),
        tables: mergedTables,
        forms: mergedForms,
        pages: totalPagesProcessed,
        confidence: "SUCCESS_SPLIT",
        metadata: {
          processor: `Document AI (split into ${chunks.length} chunks)`,
          mimeType: "application/pdf",
          note: `PDF was split into ${chunks.length} chunks and processed separately`,
          chunksProcessed: chunks.length,
        },
      };
    } finally {
      // Clean up temporary files
      console.log(`Cleaning up ${tempFiles.length} temporary chunk files...`);
      tempFiles.forEach((tempFile) => {
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.warn(
            `Failed to delete temporary file ${tempFile}: ${cleanupError.message}`
          );
        }
      });
    }
  } catch (error) {
    console.error("PDF splitting error:", error.message);
    throw new Error(`Failed to split and process PDF: ${error.message}`);
  }
}

export function isDocumentAIConfigured() {
  return !!(
    process.env.GCP_PROJECT_ID &&
    process.env.GCP_KEY_FILE &&
    process.env.DOCUMENT_AI_PROCESSOR_ID
  );
}

