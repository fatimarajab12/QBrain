// Test Cases Routes
import express from "express";
import * as testCasesController from "../controllers/testCasesController.js";
// import { authenticate } from "../middleware/auth.middleware.js"; // Uncomment when auth is ready

const router = express.Router();

// Apply auth middleware to all routes (uncomment when ready)
// router.use(authenticate);

// Get all test cases for a feature
router.get("/features/:featureId/test-cases", testCasesController.getFeatureTestCases);

// Get all test cases for a project
router.get("/projects/:projectId/test-cases", testCasesController.getProjectTestCases);

// Generate test cases for a feature using AI
router.post("/features/:featureId/generate-test-cases", testCasesController.generateTestCases);

// Bulk create test cases
router.post("/bulk", testCasesController.bulkCreateTestCases);

// Get test case by ID
router.get("/:id", testCasesController.getTestCase);

// Create test case
router.post("/", testCasesController.createTestCase);

// Update test case
router.put("/:id", testCasesController.updateTestCase);

// Delete test case
router.delete("/:id", testCasesController.deleteTestCase);

export default router;

