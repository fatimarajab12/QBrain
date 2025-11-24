// Features Routes
import express from "express";
import * as featuresController from "../controllers/featuresController.js";
// import { authenticate } from "../middleware/auth.middleware.js"; // Uncomment when auth is ready

const router = express.Router();

// Apply auth middleware to all routes (uncomment when ready)
// router.use(authenticate);

// Get all features for a project
router.get("/projects/:projectId/features", featuresController.getProjectFeatures);

// Generate features from SRS using AI
router.post("/projects/:projectId/generate-features", featuresController.generateFeatures);

// Bulk create features
router.post("/bulk", featuresController.bulkCreateFeatures);

// Get feature by ID
router.get("/:id", featuresController.getFeature);

// Create feature
router.post("/", featuresController.createFeature);

// Update feature
router.put("/:id", featuresController.updateFeature);

// Delete feature
router.delete("/:id", featuresController.deleteFeature);

export default router;

