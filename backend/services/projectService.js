import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { vectorStore } from "../vector/vectorStore.js";
import { generateEmbeddingsBatch } from "../ai/embeddings.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import * as featureService from "./featureService.js";
import * as testCaseService from "./testCaseService.js";


function validateObjectId(id, fieldName = "ID") {
  if (!id) return null;
  
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return id;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters)`);
}

/**
 * Calculates the optimal number of context chunks for downstream LLM calls.
 */
function calculateDynamicContextChunks(totalChunks, options = {}) {
const { min = 10, max = 40, percent = 0.2 } = options;
  return Math.min(Math.max(Math.ceil(totalChunks * percent), min), max);
}

export async function createProject(projectData) {
  const project = new Project({
    name: projectData.name,
    description: projectData.description || "",
    userId: projectData.userId,
  });

  await project.save();
  return project;
}

export async function getProjectById(id) {
  return await Project.findById(id).populate("userId", "name email");
}

export async function getUserProjects(userId) {
  return await Project.find({ userId }).sort({ createdAt: -1 });
}

export async function updateProject(id, updateData) {
  return await Project.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteProject(id) {
  await Project.findByIdAndDelete(id);
}

export async function getProjectStats(id) {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  return {
    projectId: project._id.toString(),
    name: project.name,
    status: project.status,
    srsDocument: project.srsDocument,
  };
}

export async function getTestCasesCount(projectId) {
  try {
    const id = validateObjectId(projectId, "Project ID");

    // Check if project exists
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    // Count test cases for this project
    const { TestCase } = await import("../models/TestCase.js");
    const count = await TestCase.countDocuments({ projectId: id });

    return {
      projectId: id,
      testCasesCount: count,
    };
  } catch (error) {
    console.error("Error getting test cases count:", error);
    throw error;
  }
}

export async function uploadAndProcessSRS(projectId, filePath, fileName) {
  console.log(`Starting SRS processing for project: ${projectId}`);

  const id = validateObjectId(projectId, "Project ID");

  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");
  
  // Check if SRS document already exists
  if (project.srsDocument && project.srsDocument.fileName && project.srsDocument.processed) {
    throw new Error("SRS document already uploaded for this project. Each project can only have one SRS document.");
  }
  
  const projectIdString = project._id.toString();

  let text = "";
  if (filePath.endsWith(".pdf")) {
    // Dynamically import pdfjs-dist to avoid loading it unnecessarily
    //legacy/build/pdf.mjs is used for Node.js compatibility
    const PDFJS = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    /**
      PDF file on server
    ↓ (reading)
 Buffer - binary representation of the file
    ↓ (conversion)
 Uint8Array - array of numbers (0-255) representing each byte
     */

    //Here we're telling the library: "Here's the PDF data, understand it and convert it to an object we can work with"
    // Benefit: Creates a queryable PDF object with metadata and page access
    const pdf = await PDFJS.getDocument({ data: uint8Array }).promise;
    let fullText = "";
    // Benefit: Processes each page individually to manage memory usage
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      // Extract all text elements with their metadata and positioning
      // Benefit: Provides structured access to text fragments and formatting info
      const textContent = await page.getTextContent();
        
      // Transform text fragments array into coherent sentences
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    text = fullText.trim();
    console.log(
      `PDF parsed successfully. Text length: ${text.length} characters`
    );
  } else if (filePath.endsWith(".txt")) {
    text = fs.readFileSync(filePath, "utf-8");
  } else {
    throw new Error("Unsupported file type");
  }

  if (!text.trim()) throw new Error("No text found in document");

  console.log("Extracted text:\n", text);

  // Use larger chunks to reduce embedding costs (fewer API calls)
  // Cost optimization: chunkSize 2000 instead of 1000 = ~50% fewer chunks = ~50% lower cost
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000, // Increased from 1000 to reduce number of chunks by ~50%
    chunkOverlap: 300, // Increased proportionally to maintain context
  });

  const chunks = await splitter.splitText(text);
  console.log(`Split SRS into ${chunks.length} chunks (optimized for cost)`);
  const nContextChunks = calculateDynamicContextChunks(chunks.length);
  console.log("Using dynamic nContextChunks:", nContextChunks);

  chunks.forEach((chunk, idx) => {
    console.log(`\n--- Chunk ${idx} ---\n${chunk}\n-----------------\n`);
  });

  // Generate embeddings using the cheapest model: text-embedding-3-small
  // Cost: $0.02 per 1M tokens (vs $0.13 for text-embedding-3-large)
  let embeddings;
  try {
    embeddings = await generateEmbeddingsBatch(chunks); // Uses text-embedding-3-small by default
    console.log(`Generated embeddings for all chunks using cost-optimized model`);
    chunks.forEach((chunk, idx) => {
      if (idx % 5 === 0) {
        console.log(
          `Embedding sample for chunk ${idx}:`,
          embeddings[idx].slice(0, 5),
          "..."
        );
      }
    });
  } catch (err) {
    console.warn(
      `Embedding generation failed: ${err.message}. Using fallback embeddings`
    );
    embeddings = chunks.map(() => new Array(1536).fill(0.1));
  }

  const documents = chunks.map(
    (chunk, idx) =>
      new Document({
        pageContent: chunk,
        metadata: {
          projectId: projectIdString,
          source: "SRS",
          fileName,
          chunkIndex: idx,
          uploadedAt: new Date().toISOString(),
        },
      })
  );

  console.log(
    `Adding ${documents.length} documents to vectorStore for project ${projectId}`
  );
  await vectorStore.addDocuments(projectIdString, documents, embeddings);
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

  // Skip automatic feature and test case generation to reduce costs
  // Users can generate them manually from the UI when needed
  console.log("SRS processed successfully. Features and test cases can be generated manually from the UI.");

  return {
    success: true,
    chunksCount: chunks.length,
    message: "SRS processed successfully. You can now generate features and test cases manually from the project page.",
    featuresGenerated: 0,
    testCasesGenerated: 0,
  };
}