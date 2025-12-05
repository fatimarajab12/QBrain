import * as projectService from "../services/projectService.js";
import multer from "multer";
import path from "path";
import fs from "fs";

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
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB - allows large documents with many pages
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

export const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    // Use authenticated user ID from middleware
    const userId = req.user?._id || req.userId || req.body.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required. Please ensure you are authenticated.",
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

export const getUserProjects = async (req, res) => {
  try {
    // Use authenticated user ID from middleware
    const userId = req.user?._id || req.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required. Please ensure you are authenticated.",
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

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.userId;

    // Verify that the project belongs to the authenticated user
    const project = await projectService.getProjectById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user owns the project
    const projectUserId = project.userId?._id?.toString() || project.userId?.toString() || project.userId;
    const currentUserId = userId?.toString();
    
    if (projectUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this project",
      });
    }

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

export const uploadSRS = async (req, res) => {

  try {
    const { id } = req.params;
    console.log("Upload Request Received for Project ID:", id);
    console.log("File Object:", req.file);
    console.log("Body Object:", req.body);

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
    
    // Check if error is about existing SRS document
    const statusCode = error.message.includes("already uploaded") ? 409 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || "Error processing SRS document",
      error: error.message,
    });
  }
};

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

export const getTestCasesCount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await projectService.getTestCasesCount(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get test cases count error:", error);
    
    if (error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error getting test cases count",
      error: error.message,
    });
  }
};