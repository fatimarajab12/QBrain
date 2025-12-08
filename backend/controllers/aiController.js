import { queryRAG, getRAGContext, analyzeSectionMatching } from "../ai/ragService.js";
import { vectorStore } from "../vector/vectorStore.js";

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

export const getVectorInfo = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get vector info from vectorStore
    await vectorStore.ensureInitialized();
    const { data, error } = await vectorStore.client
      .from('project_vectors')
      .select('*', { count: 'exact', head: false })
      .eq('project_id', projectId)
      .limit(1);

    if (error) {
      throw error;
    }

    const { count } = await vectorStore.client
      .from('project_vectors')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    res.status(200).json({
      success: true,
      data: {
        projectId,
        vectorCount: count || 0,
        hasVectors: (count || 0) > 0,
      },
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

export const analyzeSections = async (req, res) => {
  try {
    const { projectId, section1Query, section2Query, section1Name, section2Name, nContextChunks, model } = req.body;

    if (!projectId || !section1Query || !section2Query) {
      return res.status(400).json({
        success: false,
        message: "Project ID, section1Query, and section2Query are required",
      });
    }

    const options = {
      nContextChunks: nContextChunks || 15,
      model: model || "gpt-4o",
      section1Name: section1Name || "Section 1",
      section2Name: section2Name || "Section 2",
    };

    const analysis = await analyzeSectionMatching(
      projectId,
      section1Query,
      section2Query,
      options
    );

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Section matching analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing section matching",
      error: error.message,
    });
  }
};