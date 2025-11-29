import express from "express";
import * as projectsController from "../controllers/projectsController.js";

const router = express.Router();

router.post("/", projectsController.createProject);

router.get("/", projectsController.getUserProjects);

router.get("/:id/stats", projectsController.getProjectStats);

router.get("/:id/test-cases-count", projectsController.getTestCasesCount);

router.post(
  "/:id/upload-srs",
  projectsController.upload.single("srs"),
  projectsController.uploadSRS
);

router.get("/:id", projectsController.getProject);

router.put("/:id", projectsController.updateProject);

router.delete("/:id", projectsController.deleteProject);

export default router;