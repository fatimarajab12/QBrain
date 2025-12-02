import mongoose from "mongoose";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";
import { vectorStore } from "../vector/vectorStore.js";
import { Document } from "@langchain/core/documents";


function validateObjectId(id, fieldName = "ID") {
  if (!id) return null;
  
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return id;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters)`);
}

export async function createFeature(featureData) {
  try {
    const feature = new Feature({
      ...featureData,
    });

    await feature.save();

    // Add all features (both manual and AI-generated) to vector database for chatbot support
    try {
      const projectId = feature.projectId.toString();
      
      // Create feature content for vector database
      const featureContent = `Feature: ${feature.name}\n\nDescription: ${feature.description}\n\nPriority: ${feature.priority}\n\nStatus: ${feature.status}\n\nAcceptance Criteria: ${(feature.acceptanceCriteria || []).join(", ")}`;
      
      const featureDocument = new Document({
        pageContent: featureContent,
        metadata: {
          projectId: projectId,
          source: "Feature",
          featureId: feature._id.toString(),
          type: "feature",
          isAIGenerated: feature.isAIGenerated || false,
          createdAt: new Date().toISOString(),
        },
      });

      // Add to vector database
      await vectorStore.upsertDocument(
        projectId,
        featureDocument,
        null, // embedding will be generated automatically
        { featureId: feature._id.toString(), type: "feature" }
      );

      console.log(`Added feature ${feature._id} to vector database`);
    } catch (vectorError) {
      // Log error but don't fail the creation
      console.error("Error adding feature to vector database:", vectorError);
    }

    return feature;
  } catch (error) {
    console.error("Error creating feature:", error);
    throw error;
  }
}

export async function getFeatureById(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const feature = await Feature.findById(id)
      .populate("projectId", "_id name")
      .lean();

    return feature;
  } catch (error) {
    console.error("Error getting feature:", error);
    throw error;
  }
}

export async function getProjectFeatures(projectId) {
  try {
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const features = await Feature.find({ projectId: id })
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    return features;
  } catch (error) {
    console.error("Error getting project features:", error);
    throw error;
  }
}

export async function updateFeature(featureId, updateData) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Get the feature before update to check if it was AI-generated
    const existingFeature = await Feature.findById(id);
    if (!existingFeature) {
      throw new Error("Feature not found");
    }

    if (updateData.projectId) {
      updateData.projectId = validateObjectId(updateData.projectId, "Project ID");
      
      const project = await Project.findById(updateData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    const feature = await Feature.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Update all features (both manual and AI-generated) in vector database for chatbot support
    try {
      // Handle projectId whether it's an ObjectId or populated object
      const projectId = typeof feature.projectId === 'object' && feature.projectId._id 
        ? feature.projectId._id.toString() 
        : feature.projectId.toString();
      
      // Create feature content for vector database
      const featureContent = `Feature: ${feature.name}\n\nDescription: ${feature.description}\n\nPriority: ${feature.priority}\n\nStatus: ${feature.status}\n\nAcceptance Criteria: ${(feature.acceptanceCriteria || []).join(", ")}`;
      
      const featureDocument = new Document({
        pageContent: featureContent,
        metadata: {
          projectId: projectId,
          source: "Feature",
          featureId: feature._id.toString(),
          type: "feature",
          isAIGenerated: feature.isAIGenerated || false,
          updatedAt: new Date().toISOString(),
        },
      });

      // Update or insert in vector database
      await vectorStore.upsertDocument(
        projectId,
        featureDocument,
        null, // embedding will be generated automatically
        { featureId: feature._id.toString(), type: "feature" }
      );

      console.log(`Updated feature ${feature._id} in vector database`);
    } catch (vectorError) {
      // Log error but don't fail the update
      console.error("Error updating feature in vector database:", vectorError);
    }

    return feature;
  } catch (error) {
    console.error("Error updating feature:", error);
    throw error;
  }
}

export async function deleteFeature(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Get feature before deletion to check if it was AI-generated
    const feature = await Feature.findById(id);
    if (!feature) {
      return { success: false, message: "Feature not found" };
    }

    const { TestCase } = await import("../models/TestCase.js");
    await TestCase.deleteMany({ featureId: id });
    
    await Feature.findByIdAndDelete(id);

    // Delete all features (both manual and AI-generated) from vector database for chatbot support
    try {
      const projectId = feature.projectId.toString();
      
      // Delete from vector database
      await vectorStore.deleteDocumentsByMetadata(projectId, {
        featureId: feature._id.toString(),
        type: "feature"
      });

      console.log(`Deleted feature ${feature._id} from vector database`);
    } catch (vectorError) {
      // Log error but don't fail the deletion
      console.error("Error deleting feature from vector database:", vectorError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw error;
  }
}

export async function generateFeaturesFromSRS(projectId, options = {}) {
  try {
    const id = validateObjectId(projectId, "Project ID");

    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const generatedFeatures = await generateFeaturesFromRAG(project._id.toString(), options);

    const savedFeatures = [];
    for (const featureData of generatedFeatures) {
      const feature = await createFeature({
        ...featureData,
        projectId: id,
        isAIGenerated: true,
        aiGenerationContext: JSON.stringify(options),
      });
      savedFeatures.push(feature);
    }

    return savedFeatures;
  } catch (error) {
    console.error("Error generating features from SRS:", error);
    throw error;
  }
}

export async function bulkCreateFeatures(projectId, featuresData) {
  try {
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const features = [];
    for (const featureData of featuresData) {
      const feature = new Feature({
        ...featureData,
        projectId: id,
      });
      await feature.save();
      features.push(feature);
    }

    return features;
  } catch (error) {
    console.error("Error bulk creating features:", error);
    throw error;
  }
}

export async function getTestCasesCount(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Check if feature exists
    const feature = await Feature.findById(id).select("_id");
    if (!feature) {
      throw new Error("Feature not found");
    }

    // Count test cases for this feature
    const { TestCase } = await import("../models/TestCase.js");
    const count = await TestCase.countDocuments({ featureId: id });

    return {
      featureId: id,
      testCasesCount: count,
    };
  } catch (error) {
    console.error("Error getting test cases count:", error);
    throw error;
  }
}