import mongoose from "mongoose";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";


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

    return feature;
  } catch (error) {
    console.error("Error updating feature:", error);
    throw error;
  }
}

export async function deleteFeature(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const { TestCase } = await import("../models/TestCase.js");
    await TestCase.deleteMany({ featureId: id });
    
    const feature = await Feature.findByIdAndDelete(id);
    if (!feature) {
      return { success: false, message: "Feature not found" };
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