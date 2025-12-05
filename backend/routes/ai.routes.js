import express from "express";
import * as aiController from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post("/query", aiController.queryAI);
router.post("/context", aiController.getContext);
router.get("/projects/:projectId/vector-info", aiController.getVectorInfo);

export default router;

