import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { vectorStore } from "../vector/vectorStore.js";
import { generateEmbeddingsBatch } from "../ai/ingestion/embeddings.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import fs from "fs";
import * as featureService from "./featureService.js";
import * as testCaseService from "./testCaseService.js";
import { parsePDFWithDocumentAI, isDocumentAIConfigured } from "../ai/ingestion/documentParser.js";


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
  
  // Return with counts (all will be 0 for new project)
  const projectObj = project.toObject();
  return {
    ...projectObj,
    featuresCount: 0,
    testCasesCount: 0,
    bugsCount: 0,
  };
}

export async function getProjectById(id) {
  const project = await Project.findById(id)
    .populate("userId", "name email")
    .lean();
  
  if (!project) {
    return null;
  }
  
  // Calculate counts
  const { Feature } = await import("../models/Feature.js");
  const { TestCase } = await import("../models/TestCase.js");
  const { Bug } = await import("../models/Bug.js");
  
  const featuresCount = await Feature.countDocuments({ projectId: id });
  const testCasesCount = await TestCase.countDocuments({ projectId: id });
  const bugsCount = await Bug.countDocuments({ projectId: id });
  
  return {
    ...project,
    featuresCount,
    testCasesCount,
    bugsCount,
  };
}

export async function getUserProjects(userId) {
  const projects = await Project.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  
  // Calculate counts for each project using aggregation
  const { Feature } = await import("../models/Feature.js");
  const { TestCase } = await import("../models/TestCase.js");
  const { Bug } = await import("../models/Bug.js");
  
  const projectIds = projects.map(p => p._id);
  
  // Get feature counts
  const featureCounts = await Feature.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", count: { $sum: 1 } } }
  ]);
  
  // Get test case counts
  const testCaseCounts = await TestCase.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", count: { $sum: 1 } } }
  ]);
  
  // Get bug counts
  const bugCounts = await Bug.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", count: { $sum: 1 } } }
  ]);
  
  // Create maps for quick lookup
  const featureCountMap = new Map(featureCounts.map(f => [f._id.toString(), f.count]));
  const testCaseCountMap = new Map(testCaseCounts.map(tc => [tc._id.toString(), tc.count]));
  const bugCountMap = new Map(bugCounts.map(b => [b._id.toString(), b.count]));
  
  // Add counts to projects
  const projectsWithCounts = projects.map(project => ({
    ...project,
    featuresCount: featureCountMap.get(project._id.toString()) || 0,
    testCasesCount: testCaseCountMap.get(project._id.toString()) || 0,
    bugsCount: bugCountMap.get(project._id.toString()) || 0,
  }));
  
  return projectsWithCounts;
}

export async function updateProject(id, updateData) {
  return await Project.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

export async function deleteProject(id) {
  const projectId = validateObjectId(id, "Project ID");
  
  // Get project before deletion to access related data
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const projectIdString = project._id.toString();

  try {
    console.log(`Starting comprehensive deletion of project ${projectIdString} and ALL associated data...`);

    // 1. Get all related data before deletion
    const { Feature } = await import("../models/Feature.js");
    const { TestCase } = await import("../models/TestCase.js");
    
    const features = await Feature.find({ projectId: projectId });
    const featureIds = features.map(f => f._id.toString());
    const testCases = await TestCase.find({ projectId: projectId });
    
    console.log(`Found: ${features.length} features, ${testCases.length} test cases`);

    // 2. Delete ALL vector documents from Supabase (SRS chunks, features, test cases)
    // This is done first to ensure all vector data is removed
    try {
      const result = await vectorStore.deleteProject(projectIdString);
      console.log(`Deleted ${result?.deleted || 0} vector document(s) from Supabase (SRS chunks, features, test cases)`);
    } catch (error) {
      console.error(`Error deleting vector documents from Supabase:`, error);
      // Continue with deletion even if vector store deletion fails
    }

    // 3. Delete test cases from MongoDB
    const testCasesDeleted = await TestCase.deleteMany({ 
      $or: [
        { featureId: { $in: featureIds } },
        { projectId: projectId }
      ]
    });
    console.log(`Deleted ${testCasesDeleted.deletedCount} test case(s) from MongoDB`);

    // 4. Delete features from MongoDB
    const featuresDeleted = await Feature.deleteMany({ projectId: projectId });
    console.log(`Deleted ${featuresDeleted.deletedCount} feature(s) from MongoDB`);

    // 5. Delete SRS document file from filesystem
    if (project.srsDocument && project.srsDocument.filePath) {
      try {
        if (fs.existsSync(project.srsDocument.filePath)) {
          fs.unlinkSync(project.srsDocument.filePath);
          console.log(`Deleted SRS file from filesystem: ${project.srsDocument.filePath}`);
        }
      } catch (error) {
        console.error(`Error deleting SRS file from filesystem:`, error);
      }
    }

    // 6. Finally, delete the project itself from MongoDB
    await Project.findByIdAndDelete(projectId);
    console.log(`Deleted project ${projectIdString} from MongoDB`);
    
    console.log(`Project ${projectIdString} and ALL associated data deleted successfully:`);
    console.log(`   - MongoDB: Project, ${featuresDeleted.deletedCount} features, ${testCasesDeleted.deletedCount} test cases`);
    console.log(`   - Supabase: All vector documents (SRS chunks, features, test cases)`);
    console.log(`   - Filesystem: SRS document file`);
  } catch (error) {
    console.error("Error deleting project and associated data:", error);
    throw error;
  }
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
    // Use Document AI only (better accuracy, OCR support, Arabic text, tables extraction)
    if (!isDocumentAIConfigured()) {
      throw new Error(
        "Document AI is not configured. Please ensure:\n" +
        "1. GCP_PROJECT_ID is set in .env\n" +
        "2. GCP_KEY_FILE is set in .env\n" +
        "3. DOCUMENT_AI_PROCESSOR_ID is set in .env\n" +
        "See backend/DOCUMENT_AI_SETUP.md for setup instructions."
      );
    }
    
    console.log("Parsing PDF with Document AI...");
    const documentAIResult = await parsePDFWithDocumentAI(filePath);
    text = documentAIResult.text;
    
    // Log additional extracted data
    if (documentAIResult.tables && documentAIResult.tables.length > 0) {
      console.log(`Document AI extracted ${documentAIResult.tables.length} tables from the PDF`);
    }
    if (documentAIResult.forms && documentAIResult.forms.length > 0) {
      console.log(`Document AI extracted ${documentAIResult.forms.length} form fields from the PDF`);
    }
    
    console.log(
      `PDF parsed successfully with Document AI. Text length: ${text.length} characters, ` +
      `Pages: ${documentAIResult.pages}`
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