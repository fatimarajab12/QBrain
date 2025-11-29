import express from "express";
import * as featuresController from "../controllers/featuresController.js";

const router = express.Router();

router.get("/projects/:projectId/features", featuresController.getProjectFeatures);

router.post("/projects/:projectId/generate-features", featuresController.generateFeatures);

router.post("/bulk", featuresController.bulkCreateFeatures);

router.get("/:id/test-cases-count", featuresController.getTestCasesCount);

router.get("/:id", featuresController.getFeature);

router.post("/", featuresController.createFeature);

router.put("/:id", featuresController.updateFeature);

router.delete("/:id", featuresController.deleteFeature);

export default router;