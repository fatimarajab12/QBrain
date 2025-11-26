import express from "express";
import * as bugsController from "../controllers/bugsController.js";

const router = express.Router();

router.get("/projects/:projectId/bugs", bugsController.getProjectBugs);

router.post("/:id/analyze", bugsController.analyzeBug);

router.get("/:id", bugsController.getBug);

router.post("/", bugsController.createBug);

router.put("/:id", bugsController.updateBug);

router.delete("/:id", bugsController.deleteBug);

export default router;