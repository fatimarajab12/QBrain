// AI Routes - RAG and AI operations
import express from "express";
import * as aiController from "../controllers/aiController.js";
// import { authenticate } from "../middleware/auth.middleware.js"; // Uncomment when auth is ready

const router = express.Router();

// Apply auth middleware to all routes (uncomment when ready)
// router.use(authenticate);

// Query RAG system
router.post("/query", aiController.queryAI);

// Get RAG context
router.post("/context", aiController.getContext);

// Get vector collection info
router.get("/vector-info/:projectId", aiController.getVectorInfo);

export default router;

