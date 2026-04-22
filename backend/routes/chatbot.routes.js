/**
 * Chat Bot Routes
 */

import express from "express";
import * as chatbotController from "../controllers/chatbotController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post("/query", chatbotController.queryChatBotHandler);
router.post("/context", chatbotController.getChatBotContextHandler);

export default router;

