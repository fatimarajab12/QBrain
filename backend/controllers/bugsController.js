import * as bugService from "../services/bugService.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/AppError.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer configuration for bug attachments (images and files)
const bugStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/bugs";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `bug-attachment-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const bugUpload = multer({
  storage: bugStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, documents, and common file types
    const allowedTypes = [
      ".jpg", ".jpeg", ".png", ".gif", ".webp", // Images
      ".pdf", ".doc", ".docx", ".txt", // Documents
      ".csv", ".xls", ".xlsx", // Spreadsheets
      ".zip", ".rar", ".7z", // Archives
      ".mp4", ".avi", ".mov", ".webm", // Videos (for screen recordings)
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(", ")}`), false);
    }
  },
});

export const createBug = async (req, res, next) => {
  try {
    // Parse JSON body if it exists (for non-file fields)
    let bugData = {};
    if (req.body.bugData) {
      try {
        bugData = typeof req.body.bugData === 'string' ? JSON.parse(req.body.bugData) : req.body.bugData;
      } catch (e) {
        bugData = req.body;
      }
    } else {
      bugData = req.body;
    }

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

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
      bugData.attachments = attachments.map(att => att.path); // Store file paths
      bugData.attachmentDetails = attachments; // Store full details
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
    
    // Parse JSON body if it exists (for non-file fields)
    let bugData = {};
    if (req.body.bugData) {
      try {
        bugData = typeof req.body.bugData === 'string' ? JSON.parse(req.body.bugData) : req.body.bugData;
      } catch (e) {
        bugData = req.body;
      }
    } else {
      bugData = req.body;
    }
    
    bugData.featureId = featureId;

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

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));
      bugData.attachments = attachments.map(att => att.path); // Store file paths
      bugData.attachmentDetails = attachments; // Store full details
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

// Upload attachment for existing bug
export const uploadBugAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return next(new BadRequestError("No file uploaded"));
    }

    const attachment = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    const bug = await bugService.addAttachment(id, attachment.path);

    res.status(200).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: {
        bug,
        attachment: {
          path: attachment.path,
          originalname: attachment.originalname,
          size: attachment.size,
        },
      },
    });
  } catch (error) {
    if (error.message === "Bug not found") {
      return next(new NotFoundError("Bug not found"));
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

