import express from "express";
import * as testCasesController from "../controllers/testCasesController.js";

const router = express.Router();

router.get("/features/:featureId/test-cases", testCasesController.getFeatureTestCases);

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

export default router;