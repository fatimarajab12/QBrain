import express from "express";
import * as testCasesController from "../controllers/testCasesController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.get("/features/:featureId/test-cases", testCasesController.getFeatureTestCases);

router.get("/features/:featureId/has-ai-test-cases", testCasesController.checkHasAIGeneratedTestCases);

// Alternative shorter route for feature test cases
router.get("/feature/:featureId", testCasesController.getFeatureTestCases);

router.get("/projects/:projectId/test-cases", testCasesController.getProjectTestCases);

router.post("/features/:featureId/generate-test-cases", testCasesController.generateTestCases);

router.post("/features/:featureId", testCasesController.createTestCaseForFeature);

router.post("/bulk", testCasesController.bulkCreateTestCases);

router.get("/by-feature/:featureId", testCasesController.getFeatureTestCases);

router.get("/:id/check", testCasesController.checkTestCaseExists);

router.get("/:id", testCasesController.getTestCase);

router.post("/", testCasesController.createTestCase);

router.put("/:id", testCasesController.updateTestCase);

router.delete("/:id", testCasesController.deleteTestCase);

// Gherkin conversion endpoints
router.get("/:id/gherkin", testCasesController.convertToGherkin);
router.get("/features/:featureId/gherkin", testCasesController.convertFeatureTestCasesToGherkin);

// Export endpoints
router.get("/projects/:projectId/all", testCasesController.getAllTestCasesByFeatures);
router.get("/projects/:projectId/export/excel", testCasesController.exportAllTestCasesToExcel);

export default router;