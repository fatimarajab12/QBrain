import * as featureService from "../services/featureService.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";

export const createFeature = async (req, res, next) => {
  try {
    const featureData = req.body;

    if (!featureData.name || !featureData.projectId) {
      return next(new BadRequestError("Feature name and project ID are required"));
    }

    const feature = await featureService.createFeature(featureData);

    res.status(201).json({
      success: true,
      message: "Feature created successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feature = await featureService.getFeatureById(id);

    if (!feature) {
      return next(new NotFoundError("Feature not found"));
    }

    res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectFeatures = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] getProjectFeatures controller - projectId:", projectId);
    }
    
    if (!projectId) {
      return next(new BadRequestError("Project ID is required"));
    }
    
    const features = await featureService.getProjectFeatures(projectId);

    res.status(200).json({
      success: true,
      count: features.length,
      data: features,
    });
  } catch (error) {
    // Handle specific error cases
    if (error.message === "Project not found") {
      return next(new NotFoundError("Project not found"));
    }
    
    if (error.message.includes("Invalid") || error.message.includes("required")) {
      return next(new BadRequestError(error.message));
    }
    
    next(error);
  }
};

export const updateFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const feature = await featureService.updateFeature(id, updateData);

    if (!feature) {
      return next(new NotFoundError("Feature not found"));
    }

    res.status(200).json({
      success: true,
      message: "Feature updated successfully",
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeature = async (req, res, next) => {
  try {
    const { id } = req.params;
    await featureService.deleteFeature(id);

    res.status(200).json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const generateFeatures = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    // Safely extract options from request body
    const options = (req.body && req.body.options) ? req.body.options : {};

    const features = await featureService.generateFeaturesFromSRS(projectId, options);

    res.status(200).json({
      success: true,
      message: `Generated ${features.length} features successfully`,
      count: features.length,
      data: features,
    });
  } catch (error) {
    next(error);
  }
};

export const checkHasAIGeneratedFeatures = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const hasAIGenerated = await featureService.hasAIGeneratedFeatures(projectId);

    res.status(200).json({
      success: true,
      hasAIGenerated,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateFeatures = async (req, res, next) => {
  try {
    const { projectId, features } = req.body;

    if (!projectId || !Array.isArray(features) || features.length === 0) {
      return next(new BadRequestError("Project ID and features array are required"));
    }

    const createdFeatures = await featureService.bulkCreateFeatures(projectId, features);

    // Calculate performance metrics if this is an approval action
    if (req.body.calculateMetrics && createdFeatures.length > 0) {
      try {
        const { generatePerformanceReport, trackPerformanceMetrics } = await import("../services/performanceMetricsService.js");
        
        // Get all generated features for this project
        const allGeneratedFeatures = await featureService.getProjectFeatures(projectId);
        const aiGeneratedFeatures = allGeneratedFeatures.filter(f => f.isAIGenerated);
        
        // Sort features by priority and creation date (simple sorting without ranking service)
        const sortedFeatures = [...aiGeneratedFeatures].sort((a, b) => {
          // First sort by priority (High > Medium > Low)
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const aPriority = priorityOrder[a.priority] || 2;
          const bPriority = priorityOrder[b.priority] || 2;
          if (bPriority !== aPriority) {
            return bPriority - aPriority;
          }
          // Then by creation date (newest first)
          const aDate = new Date(a.createdAt || 0);
          const bDate = new Date(b.createdAt || 0);
          return bDate - aDate;
        });
        
        // Calculate metrics (approved features = createdFeatures)
        const metrics = generatePerformanceReport(
          sortedFeatures,
          createdFeatures,
          [] // rejected items (can be added later)
        );

        // Save metrics to MongoDB
        await trackPerformanceMetrics(projectId, "features", metrics);

        console.log(`[Performance Metrics] Project ${projectId}:`, metrics);
      } catch (metricsError) {
        console.error("Error calculating performance metrics:", metricsError);
        // Don't fail the request if metrics calculation fails
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdFeatures.length} features successfully`,
      count: createdFeatures.length,
      data: createdFeatures,
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformanceMetrics = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const { generatePerformanceReport } = await import("../services/performanceMetricsService.js");
    
    // Get all AI-generated features for this project
    const allFeatures = await featureService.getProjectFeatures(projectId);
    const aiGeneratedFeatures = allFeatures.filter(f => f.isAIGenerated);
    
    if (aiGeneratedFeatures.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No AI-generated features found",
        data: {
          recallAt1: 0,
          recallAt5: 0,
          recallAt10: 0,
          accuracy: 0,
          totalGenerated: 0,
          totalApproved: 0,
        },
      });
    }
    
    // Sort features by priority and creation date (simple sorting without ranking service)
    const sortedFeatures = [...aiGeneratedFeatures].sort((a, b) => {
      // First sort by priority (High > Medium > Low)
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }
      // Then by creation date (newest first)
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      return bDate - aDate;
    });
    
    // For now, consider all features as "approved" (in real scenario, track user approvals)
    // In the future, we can track which features were actually approved/rejected
    const approvedFeatures = aiGeneratedFeatures; // All features are considered approved for now
    
    // Calculate metrics
    const metrics = generatePerformanceReport(
      sortedFeatures,
      approvedFeatures,
      []
    );
    
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestCasesCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await featureService.getTestCasesCount(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === "Feature not found") {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};