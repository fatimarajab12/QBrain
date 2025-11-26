import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";
import { nanoid } from "nanoid";

export async function createFeature(featureData) {
  try {
    const featureId = `feature_${nanoid(10)}`;
    const feature = new Feature({
      ...featureData,
      featureId,
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
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    })
      .populate("projectId", "name projectId")
      .lean();

    return feature;
  } catch (error) {
    console.error("Error getting feature:", error);
    throw error;
  }
}

export async function getProjectFeatures(projectId) {
  try {
    const project = await Project.findOne({
      $or: [{ _id: projectId }, { projectId }],
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const features = await Feature.find({ projectId: project._id }).sort({
      priority: -1,
      createdAt: -1,
    });

    return features;
  } catch (error) {
    console.error("Error getting project features:", error);
    throw error;
  }
}

export async function updateFeature(featureId, updateData) {
  try {
    const feature = await Feature.findOneAndUpdate(
      { $or: [{ _id: featureId }, { featureId }] },
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
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    });

    if (feature) {

      const { TestCase } = await import("../models/TestCase.js");

      await TestCase.deleteMany({ featureId: feature._id });

      await Feature.findByIdAndDelete(feature._id);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw error;
  }
}

export async function generateFeaturesFromSRS(projectId, options = {}) {
  try {
    const project = await Project.findOne({
      $or: [{ _id: projectId }, { projectId }],
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const generatedFeatures = await generateFeaturesFromRAG(project.projectId, options);

    const savedFeatures = [];
    for (const featureData of generatedFeatures) {
      const feature = await createFeature({
        ...featureData,
        projectId: project._id,
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
    const project = await Project.findOne({
      $or: [{ _id: projectId }, { projectId }],
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const features = [];
    for (const featureData of featuresData) {
      const featureId = `feature_${nanoid(10)}`;
      const feature = new Feature({
        ...featureData,
        featureId,
        projectId: project._id,
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