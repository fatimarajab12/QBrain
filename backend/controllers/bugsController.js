import * as bugService from "../services/bugService.js";

export const createBug = async (req, res) => {
  try {
    const bugData = req.body;

    if (!bugData.title || !bugData.description || !bugData.projectId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and project ID are required",
      });
    }

    bugData.reportedBy = req.user?.id || bugData.reportedBy;

    const bug = await bugService.createBug(bugData);

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      data: bug,
    });
  } catch (error) {
    console.error("Create bug error:", error);
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

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bug,
    });
  } catch (error) {
    console.error("Get bug error:", error);
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
    };

    const bugs = await bugService.getProjectBugs(projectId, filters);

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    console.error("Get project bugs error:", error);
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

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bug updated successfully",
      data: bug,
    });
  } catch (error) {
    console.error("Update bug error:", error);
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
    res.status(500).json({
      success: false,
      message: "Error deleting bug",
      error: error.message,
    });
  }
};

export const analyzeBug = async (req, res) => {
  try {
    const { id } = req.params;
    const bug = await bugService.analyzeBug(id);

    res.status(200).json({
      success: true,
      message: "Bug analyzed successfully",
      data: bug,
    });
  } catch (error) {
    console.error("Analyze bug error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing bug",
      error: error.message,
    });
  }
};