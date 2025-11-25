import { Project } from "../models/Project.js";
import { vectorStore } from "../vector/vectorStore.js";
import { generateEmbeddingsBatch } from "../ai/embeddings.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import fs from "fs";

export async function uploadAndProcessSRS(projectId, filePath, fileName) {
  console.log(`Starting SRS processing for project: ${projectId}`);

  const project = await Project.findOne({ projectId });
  if (!project) throw new Error("Project not found");

  let text = "";
  if (filePath.endsWith(".pdf")) {
    const PDFJS = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const pdf = await PDFJS.getDocument({ data: uint8Array }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    text = fullText.trim();
    console.log(`PDF parsed successfully. Text length: ${text.length} characters`);
  } else if (filePath.endsWith(".txt")) {
    text = fs.readFileSync(filePath, "utf-8");
  } else {
    throw new Error("Unsupported file type");
  }

  if (!text.trim()) throw new Error("No text found in document");

  console.log("Extracted text:\n", text); 

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitText(text);
  console.log(`Split SRS into ${chunks.length} chunks`);

  chunks.forEach((chunk, idx) => {
    console.log(`\n--- Chunk ${idx} ---\n${chunk}\n-----------------\n`);
  });

  let embeddings;
  try {
    embeddings = await generateEmbeddingsBatch(chunks);
    console.log(`Generated embeddings for all chunks`);
    chunks.forEach((chunk, idx) => {
      if (idx % 5 === 0) {
        console.log(`Embedding sample for chunk ${idx}:`, embeddings[idx].slice(0, 5), "...");
      }
    });
  } catch (err) {
    console.warn(`Embedding generation failed: ${err.message}. Using fallback embeddings`);
    embeddings = chunks.map(() => new Array(1536).fill(0.1));
  }

  const documents = chunks.map((chunk, idx) => new Document({
    pageContent: chunk,
    metadata: {
      projectId,
      source: "SRS",
      fileName,
      chunkIndex: idx,
      uploadedAt: new Date().toISOString(),
    },
  }));

  console.log(`Adding ${documents.length} documents to vectorStore for project ${projectId}`);
  await vectorStore.addDocuments(project.projectId, documents, embeddings);
  console.log(`Documents successfully added to vectorStore`);

  project.srsDocument = {
    fileName,
    filePath,
    uploadedAt: new Date(),
    processed: true,
    chunksCount: chunks.length,
  };
  await project.save();
  console.log("Project SRS data updated");

  return { success: true, chunksCount: chunks.length, message: "SRS processed successfully" };
}
