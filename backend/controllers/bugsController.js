import * as bugService from "../services/bugService.js";

export const createBug = async (req, res) => {
  try {
    const bugData = req.body;

    if (!bugData || !bugData.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Get user ID from authenticated request
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
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
      return res.status(400).json({
        success: false,
        message: "Feature ID is required (in body or params)",
      });
    }

    const bug = await bugService.createBug(bugData);

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      data: bug,
    });
  } catch (error) {
    console.error("Create bug error:", error);
    
    if (error.message === "Feature not found" || error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating bug",
      error: error.message,
    });
  }
};

export const createBugForFeature = async (req, res) => {
  try {
    const { featureId, projectId } = req.params;
    const bugData = { ...req.body, featureId };

    if (projectId) {
      bugData.projectId = projectId;
    }

    if (!bugData.title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Get user ID from authenticated request
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    bugData.reportedBy = userId;

    const bug = await bugService.createBug(bugData);

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      data: bug,
    });
  } catch (error) {
    console.error("Create bug for feature error:", error);
    
    if (error.message === "Feature not found" || error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating bug",
      error: error.message,
    });
  }
};

export const getBug = async (req, res) => {
  try {
    const { id } = req.params;

    const bug = await bugService.getBugById(id);

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    console.error("Get bug error:", error);
    
    if (error.message === "Bug not found") {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error getting bug",
      error: error.message,
    });
  }
};

export const getProjectBugs = async (req, res) => {
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
    console.error("Get project bugs error:", error);
    
    if (error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error getting bugs",
      error: error.message,
    });
  }
};

export const getFeatureBugs = async (req, res) => {
  try {
    const { featureId } = req.params;

    const bugs = await bugService.getFeatureBugs(featureId);

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    console.error("Get feature bugs error:", error);
    
    if (error.message === "Feature not found") {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error getting bugs",
      error: error.message,
    });
  }
};

export const updateBug = async (req, res) => {
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
    console.error("Update bug error:", error);
    
    if (error.message === "Bug not found" || error.message === "Feature not found" || error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    if (error.message.includes("Invalid status")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating bug",
      error: error.message,
    });
  }
};

export const deleteBug = async (req, res) => {
  try {
    const { id } = req.params;

    await bugService.deleteBug(id);

    res.status(200).json({
      success: true,
      message: "Bug deleted successfully",
    });
  } catch (error) {
    console.error("Delete bug error:", error);
    
    if (error.message === "Bug not found") {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error deleting bug",
      error: error.message,
    });
  }
};

export const getBugStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await bugService.getBugStats(projectId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get bug stats error:", error);
    
    if (error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error getting bug stats",
      error: error.message,
    });
  }
};

