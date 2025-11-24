// Features Controller
import * as featureService from "../services/featureService.js";

/**
 * Create a new feature
 * POST /api/features
 */
export const createFeature = async (req, res) => {
  try {
    const featureData = req.body;

    if (!featureData.name || !featureData.projectId) {
      return res.status(400).json({
        success: false,
        message: "Feature name and project ID are required",
      });
    }

    const feature = await featureService.createFeature(featureData);

    res.status(201).json({
      success: true,
      message: "Feature created successfully",
      data: feature,
    });
  } catch (error) {
    console.error("Create feature error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating feature",
      error: error.message,
    });
  }
};

/**
 * Get feature by ID
 * GET /api/features/:id
 */
export const getFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await featureService.getFeatureById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    console.error("Get feature error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting feature",
      error: error.message,
    });
  }
};

/**
 * Get all features for a project
 * GET /api/projects/:projectId/features
 */
export const getProjectFeatures = async (req, res) => {
  try {
    const { projectId } = req.params;
    const features = await featureService.getProjectFeatures(projectId);

    res.status(200).json({
      success: true,
      count: features.length,
      data: features,
    });
  } catch (error) {
    console.error("Get project features error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting features",
      error: error.message,
    });
  }
};

/**
 * Update feature
 * PUT /api/features/:id
 */
export const updateFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const feature = await featureService.updateFeature(id, updateData);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: feature,
    });
  } catch (error) {
    console.error("Update feature error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feature",
      error: error.message,
    });
  }
};

/**
 * Delete feature
 * DELETE /api/features/:id
 */
export const deleteFeature = async (req, res) => {
  try {
    const { id } = req.params;
    await featureService.deleteFeature(id);

    res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    console.error("Delete feature error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting feature",
      error: error.message,
    });
  }
};

/**
 * Generate features from SRS using AI
 * POST /api/projects/:projectId/generate-features
 */
export const generateFeatures = async (req, res) => {
  try {
    const { projectId } = req.params;
    const options = req.body.options || {};

    const features = await featureService.generateFeaturesFromSRS(projectId, options);

    res.status(200).json({
      success: true,
      message: `Generated ${features.length} features successfully`,
      count: features.length,
      data: features,
    });
  } catch (error) {
    console.error("Generate features error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating features",
      error: error.message,
    });
  }
};

/**
 * Bulk create features
 * POST /api/features/bulk
 */
export const bulkCreateFeatures = async (req, res) => {
  try {
    const { projectId, features } = req.body;

    if (!projectId || !Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Project ID and features array are required",
      });
    }

    const createdFeatures = await featureService.bulkCreateFeatures(projectId, features);

    res.status(201).json({
      success: true,
      message: `Created ${createdFeatures.length} features successfully`,
      count: createdFeatures.length,
      data: createdFeatures,
    });
  } catch (error) {
    console.error("Bulk create features error:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk creating features",
      error: error.message,
    });
  }
};

