import express from "express";
import * as testCasesController from "../controllers/testCasesController.js";

const router = express.Router();

router.get("/features/:featureId/test-cases", testCasesController.getFeatureTestCases);

router.get("/projects/:projectId/test-cases", testCasesController.getProjectTestCases);

router.post("/features/:featureId/generate-test-cases", testCasesController.generateTestCases);

router.post("/bulk", testCasesController.bulkCreateTestCases);

router.get("/:id", testCasesController.getTestCase);

router.post("/", testCasesController.createTestCase);

router.put("/:id", testCasesController.updateTestCase);

router.delete("/:id", testCasesController.deleteTestCase);

export default router;