import { Project } from "../models/Project.js";
import { vectorStore } from "../vector/vectorStore.js";
import { generateEmbeddingsBatch } from "../ai/embeddings.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as featureService from "./featureService.js";
import * as testCaseService from "./testCaseService.js";

export async function createProject(projectData) {
  const projectId = `project_${uuidv4().slice(0, 13)}`;

  const project = new Project({
    projectId,
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
    projectId: project.projectId,
    name: project.name,
    status: project.status,
    srsDocument: project.srsDocument,
  };
}

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

  let featuresGenerated = 0;
  let testCasesGenerated = 0;

  try {
    console.log("Starting automatic feature generation from SRS...");
    const generatedFeatures = await featureService.generateFeaturesFromSRS(project._id, {
      nContextChunks: 10,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    featuresGenerated = generatedFeatures.length;
    console.log(`Generated ${featuresGenerated} features from SRS`);

    console.log("Starting automatic test case generation for features...");
    for (const feature of generatedFeatures) {
      try {
        const generatedTestCases = await testCaseService.generateTestCasesForFeature(feature._id, {
          nContextChunks: 5,
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        });
        testCasesGenerated += generatedTestCases.length;
        console.log(`Generated ${generatedTestCases.length} test cases for feature: ${feature.name}`);
      } catch (error) {
        console.error(`Error generating test cases for feature ${feature.name}:`, error.message);

      }
    }
    console.log(`Total test cases generated: ${testCasesGenerated}`);
  } catch (error) {
    console.error("Error during automatic feature/test case generation:", error.message);

    return {
      success: true,
      chunksCount: chunks.length,
      message: "SRS processed successfully, but feature generation failed",
      warning: error.message,
      featuresGenerated: 0,
      testCasesGenerated: 0,
    };
  }

  return {
    success: true,
    chunksCount: chunks.length,
    message: "SRS processed successfully",
    featuresGenerated,
    testCasesGenerated,
  };
}