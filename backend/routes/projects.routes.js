// Projects Routes
import express from "express";
import * as projectsController from "../controllers/projectsController.js";
// import { authenticate } from "../middleware/auth.middleware.js"; // Uncomment when auth is ready

const router = express.Router();

// Apply auth middleware to all routes (uncomment when ready)
// router.use(authenticate);

// Create project
router.post("/", projectsController.createProject);

// Get all projects for user
router.get("/", projectsController.getUserProjects);

// Get project statistics
router.get("/:id/stats", projectsController.getProjectStats);

// Upload and process SRS document
router.post(
  "/:id/upload-srs",
  projectsController.upload.single("srs"),
  projectsController.uploadSRS
);

// Get project by ID
router.get("/:id", projectsController.getProject);

// Update project
router.put("/:id", projectsController.updateProject);

// Delete project
router.delete("/:id", projectsController.deleteProject);

export default router;

