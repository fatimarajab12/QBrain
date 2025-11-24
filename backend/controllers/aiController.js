// AI Controller - RAG queries and AI operations
import { queryRAG, getRAGContext } from "../ai/ragService.js";
import { vectorDB } from "../vector/vectorDB.js";

/**
 * Query RAG system with a question
 * POST /api/ai/query
 */
export const queryAI = async (req, res) => {
  try {
    const { projectId, question } = req.body;

    if (!projectId || !question) {
      return res.status(400).json({
        success: false,
        message: "Project ID and question are required",
      });
    }
    const nResults = req.body.nResults || 5;
    const response = await queryRAG(projectId, question, nResults);

    res.status(200).json({
      success: true,
      data: {
        question,
        answer: response,
        projectId,
      },
    });
  } catch (error) {
    console.error("AI query error:", error);
    res.status(500).json({
      success: false,
      message: "Error querying AI",
      error: error.message,
    });
  }
};

/**
 * Get RAG context for a query (without generating response)
 * POST /api/ai/context
 */
export const getContext = async (req, res) => {
  try {
    const { projectId, query } = req.body;

    if (!projectId || !query) {
      return res.status(400).json({
        success: false,
        message: "Project ID and query are required",
      });
    }

    const nResults = req.body.nResults || 5;
    const context = await getRAGContext(projectId, query, nResults);

    res.status(200).json({
      success: true,
      data: {
        query,
        context,
        projectId,
      },
    });
  } catch (error) {
    console.error("Get context error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting context",
      error: error.message,
    });
  }
};

/**
 * Get vector collection info
 * GET /api/ai/vector-info/:projectId
 */
export const getVectorInfo = async (req, res) => {
  try {
    const { projectId } = req.params;

    const info = await vectorDB.getCollectionInfo(projectId);

    res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error("Get vector info error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting vector info",
      error: error.message,
    });
  }
};

