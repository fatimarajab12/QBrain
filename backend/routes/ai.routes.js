import express from "express";
import * as aiController from "../controllers/aiController.js";

const router = express.Router();

router.post("/query", aiController.queryAI);

router.post("/context", aiController.getContext);

router.get("/vector-info/:projectId", aiController.getVectorInfo);

export default router;