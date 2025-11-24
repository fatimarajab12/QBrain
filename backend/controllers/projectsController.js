// Projects Controller
import * as projectService from "../services/projectService.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `srs-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"), false);
    }
  },
});

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const userId = req.user?.id || req.body.userId; // Adjust based on your auth middleware

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await projectService.createProject({
      name,
      description: description || "",
      status: status || "active",
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating project",
      error: error.message,
    });
  }
};

/**
 * Get project by ID
 * GET /api/projects/:id
 */
export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting project",
      error: error.message,
    });
  }
};

/**
 * Get all projects for user
 * GET /api/projects
 */
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId; // Adjust based on your auth middleware

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const projects = await projectService.getUserProjects(userId);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get user projects error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting projects",
      error: error.message,
    });
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await projectService.updateProject(id, updateData);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating project",
      error: error.message,
    });
  }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  }
};

/**
 * Upload and process SRS document
 * POST /api/projects/:id/upload-srs
 */
export const uploadSRS = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await projectService.uploadAndProcessSRS(
      id,
      req.file.path,
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: "SRS document uploaded and processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upload SRS error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing SRS document",
      error: error.message,
    });
  }
};

/**
 * Get project statistics
 * GET /api/projects/:id/stats
 */
export const getProjectStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await projectService.getProjectStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get project stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting project statistics",
      error: error.message,
    });
  }
};

