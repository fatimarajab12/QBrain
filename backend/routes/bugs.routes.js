// Bugs Routes
import express from "express";
import * as bugsController from "../controllers/bugsController.js";
// import { authenticate } from "../middleware/auth.middleware.js"; // Uncomment when auth is ready

const router = express.Router();

// Apply auth middleware to all routes (uncomment when ready)
// router.use(authenticate);

// Get all bugs for a project
router.get("/projects/:projectId/bugs", bugsController.getProjectBugs);

// Analyze bug using AI
router.post("/:id/analyze", bugsController.analyzeBug);

// Get bug by ID
router.get("/:id", bugsController.getBug);

// Create bug
router.post("/", bugsController.createBug);

// Update bug
router.put("/:id", bugsController.updateBug);

// Delete bug
router.delete("/:id", bugsController.deleteBug);

export default router;

