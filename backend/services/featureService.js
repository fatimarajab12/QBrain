// Feature Service - MongoDB + AI integration
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";
import { nanoid } from "nanoid";

/**
 * Create a new feature
 * @param {Object} featureData - Feature data
 * @returns {Promise<Object>} Created feature
 */
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

/**
 * Get feature by ID
 * @param {string} featureId - Feature ID or MongoDB _id
 * @returns {Promise<Object>} Feature
 */
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

/**
 * Get all features for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Features array
 */
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

/**
 * Update feature
 * @param {string} featureId - Feature ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated feature
 */
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

/**
 * Delete feature
 * @param {string} featureId - Feature ID
 * @returns {Promise<void>}
 */
export async function deleteFeature(featureId) {
  try {
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    });

    if (feature) {
      // Import here to avoid circular dependency
      const { TestCase } = await import("../models/TestCase.js");

      // Delete associated test cases
      await TestCase.deleteMany({ featureId: feature._id });

      // Delete feature
      await Feature.findByIdAndDelete(feature._id);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw error;
  }
}

/**
 * Generate features from SRS using AI/RAG
 * @param {string} projectId - Project ID
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Generated features
 */
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

    // Generate features using RAG
    const generatedFeatures = await generateFeaturesFromRAG(project.projectId, options);

    // Save features to MongoDB
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

/**
 * Bulk create features
 * @param {string} projectId - Project ID
 * @param {Array<Object>} featuresData - Array of feature data
 * @returns {Promise<Array>} Created features
 */
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

