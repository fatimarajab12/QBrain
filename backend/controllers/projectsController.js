import * as projectService from "../services/projectService.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from "../utils/AppError.js";

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

export const createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    // Use authenticated user ID from middleware
    const userId = req.user?._id || req.userId || req.body.userId;

    if (!name) {
      return next(new BadRequestError("Project name is required"));
    }

    if (!userId) {
      return next(new BadRequestError("User ID is required. Please ensure you are authenticated."));
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
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    if (!project) {
      return next(new NotFoundError("Project not found"));
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProjects = async (req, res, next) => {
  try {
    // Use authenticated user ID from middleware
    const userId = req.user?._id || req.userId || req.query.userId;

    if (!userId) {
      return next(new BadRequestError("User ID is required. Please ensure you are authenticated."));
    }

    const projects = await projectService.getUserProjects(userId);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await projectService.updateProject(id, updateData);

    if (!project) {
      return next(new NotFoundError("Project not found"));
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.userId;

    // Verify that the project belongs to the authenticated user
    const project = await projectService.getProjectById(id);
    if (!project) {
      return next(new NotFoundError("Project not found"));
    }

    // Check if user owns the project
    const projectUserId = project.userId?._id?.toString() || project.userId?.toString() || project.userId;
    const currentUserId = userId?.toString();
    
    if (projectUserId !== currentUserId) {
      return next(new ForbiddenError("You don't have permission to delete this project"));
    }

    await projectService.deleteProject(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadSRS = async (req, res, next) => {

  try {
    const { id } = req.params;
    console.log("Upload Request Received for Project ID:", id);
    console.log("File Object:", req.file);
    console.log("Body Object:", req.body);

    if (!req.file) {
      return next(new BadRequestError("No file uploaded"));
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
    // Check if error is about existing SRS document
    if (error.message && error.message.includes("already uploaded")) {
      return next(new ConflictError(error.message));
    }
    next(error);
  }
};

export const getProjectStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await projectService.getProjectStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestCasesCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await projectService.getTestCasesCount(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.message === "Project not found") {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};