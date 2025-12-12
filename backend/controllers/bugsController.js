import * as bugService from "../services/bugService.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/AppError.js";

export const createBug = async (req, res, next) => {
  try {
    const bugData = req.body;

    if (!bugData || !bugData.title) {
      return next(new BadRequestError("Title is required"));
    }

    // Get user ID from authenticated request
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return next(new UnauthorizedError("Authentication required"));
    }

    bugData.reportedBy = userId;

    // featureId can be in body or params
    if (req.params.featureId) {
      bugData.featureId = req.params.featureId;
    }

    // projectId can be in body or params
    if (req.params.projectId) {
      bugData.projectId = req.params.projectId;
    }

    if (!bugData.featureId) {
      return next(new BadRequestError("Feature ID is required (in body or params)"));
    }

    const bug = await bugService.createBug(bugData);

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      data: bug,
    });
  } catch (error) {
    if (error.message === "Feature not found" || error.message === "Project not found") {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};

export const createBugForFeature = async (req, res, next) => {
  try {
    const { featureId, projectId } = req.params;
    const bugData = { ...req.body, featureId };

    if (projectId) {
      bugData.projectId = projectId;
    }

    if (!bugData.title) {
      return next(new BadRequestError("Title is required"));
    }

    // Get user ID from authenticated request
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return next(new UnauthorizedError("Authentication required"));
    }

    bugData.reportedBy = userId;

    const bug = await bugService.createBug(bugData);

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      data: bug,
    });
  } catch (error) {
    if (error.message === "Feature not found" || error.message === "Project not found") {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};

export const getBug = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bug = await bugService.getBugById(id);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    if (error.message === "Bug not found") {
      return next(new NotFoundError("Bug not found"));
    }
    next(error);
  }
};

export const getProjectBugs = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const filters = {
      status: req.query.status,
      severity: req.query.severity,
      featureId: req.query.featureId,
      assignedTo: req.query.assignedTo,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const bugs = await bugService.getProjectBugs(projectId, filters);

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    if (error.message === "Project not found") {
      return next(new NotFoundError("Project not found"));
    }
    next(error);
  }
};

export const getFeatureBugs = async (req, res, next) => {
  try {
    const { featureId } = req.params;

    const bugs = await bugService.getFeatureBugs(featureId);

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    if (error.message === "Feature not found") {
      return next(new NotFoundError("Feature not found"));
    }
    next(error);
  }
};

export const updateBug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const bug = await bugService.updateBug(id, updateData);

    res.status(200).json({
      success: true,
      message: "Bug updated successfully",
      data: bug,
    });
  } catch (error) {
    if (error.message === "Bug not found" || error.message === "Feature not found" || error.message === "Project not found") {
      return next(new NotFoundError(error.message));
    }
    
    if (error.message.includes("Invalid status")) {
      return next(new BadRequestError(error.message));
    }
    
    next(error);
  }
};

export const deleteBug = async (req, res, next) => {
  try {
    const { id } = req.params;

    await bugService.deleteBug(id);

    res.status(200).json({
      success: true,
      message: "Bug deleted successfully",
    });
  } catch (error) {
    if (error.message === "Bug not found") {
      return next(new NotFoundError("Bug not found"));
    }
    next(error);
  }
};

export const getBugStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const stats = await bugService.getBugStats(projectId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error.message === "Project not found") {
      return next(new NotFoundError("Project not found"));
    }
    next(error);
  }
};

