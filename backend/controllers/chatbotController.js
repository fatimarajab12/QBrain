/**
 * Chat Bot Controller
 */

import { queryChatBot, getChatBotContext } from "../ai/chatbot/index.js";
import { BadRequestError } from "../utils/AppError.js";
import { validateHistory } from "../ai/chatbot/index.js";

export const queryChatBotHandler = async (req, res, next) => {
  try {
    const { projectId, question, history } = req.body;

    if (!projectId || !question) {
      return next(new BadRequestError("Project ID and question are required"));
    }

    const validHistory = history && validateHistory(history) ? history : [];
    const nResults = req.body.nResults || 5;
    const model = req.body.model;
    const temperature = req.body.temperature;

    const answer = await queryChatBot(projectId, question, nResults, validHistory, {
      model,
      temperature,
    });

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        projectId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatBotContextHandler = async (req, res, next) => {
  try {
    const { projectId, query, history } = req.body;

    if (!projectId || !query) {
      return next(new BadRequestError("Project ID and query are required"));
    }

    const validHistory = history && validateHistory(history) ? history : [];
    const nResults = req.body.nResults || 5;
    const chunks = await getChatBotContext(projectId, query, nResults, validHistory);

    const formattedChunks = chunks.map((chunk, index) => ({
      index: index + 1,
      content: chunk.content,
      metadata: chunk.metadata || {},
    }));

    res.status(200).json({
      success: true,
      data: {
        query,
        chunks: formattedChunks,
        count: formattedChunks.length,
        projectId,
      },
    });
  } catch (error) {
    next(error);
  }
};

