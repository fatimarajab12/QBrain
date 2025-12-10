import express from "express";
import * as bugsController from "../controllers/bugsController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get bugs for a project
router.get("/projects/:projectId", bugsController.getProjectBugs);

// Get bugs for a feature
router.get("/features/:featureId", bugsController.getFeatureBugs);

// Get bug stats for a project
router.get("/projects/:projectId/stats", bugsController.getBugStats);

// Create bug for a feature (with projectId in params)
router.post("/projects/:projectId/features/:featureId", bugsController.createBugForFeature);

// Create bug for a feature (without projectId)
router.post("/features/:featureId", bugsController.createBugForFeature);

// Get single bug
router.get("/:id", bugsController.getBug);

// Create bug (general)
router.post("/", bugsController.createBug);

// Update bug
router.put("/:id", bugsController.updateBug);
router.patch("/:id", bugsController.updateBug);

// Delete bug
router.delete("/:id", bugsController.deleteBug);

export default router;

