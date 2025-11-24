// RAG (Retrieval Augmented Generation) Service
import { vectorDB } from "../vector/vectorDB.js";
import { generateEmbedding } from "./embeddings.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Query RAG system: search vector DB + generate AI response
 * @param {string} projectId - Project identifier
 * @param {string} question - User question
 * @param {number} nResults - Number of context chunks to retrieve
 * @returns {Promise<string>} AI-generated response
 */
export async function queryRAG(projectId, question, nResults = 5) {
  try {
    // Step 1: Search for similar chunks in Vector DB
    const similarChunks = await vectorDB.searchSimilar(projectId, question, nResults);

    if (!similarChunks || similarChunks.length === 0) {
      return "No relevant information found in the project knowledge base.";
    }

    // Step 2: Build context from retrieved chunks
    const context = similarChunks
      .map((chunk, index) => `[Context ${index + 1}]\n${chunk.document}`)
      .join("\n\n");

    // Step 3: Generate response using OpenAI with context
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that answers questions based on the provided context from project documentation. Only use information from the context. If the context doesn't contain relevant information, say so.",
        },
        {
          role: "user",
          content: `Context from project documentation:\n\n${context}\n\nQuestion: ${question}\n\nAnswer:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("RAG query error:", error);
    throw error;
  }
}

/**
 * Get context chunks for a query (without generating response)
 * @param {string} projectId - Project identifier
 * @param {string} query - Query text
 * @param {number} nResults - Number of results
 * @returns {Promise<Array>} Context chunks
 */
export async function getRAGContext(projectId, query, nResults = 5) {
  try {
    const similarChunks = await vectorDB.searchSimilar(projectId, query, nResults);
    return similarChunks.map((chunk) => ({
      text: chunk.document,
      metadata: chunk.metadata,
      relevance: chunk.distance ? 1 - chunk.distance : null,
    }));
  } catch (error) {
    console.error("Error getting RAG context:", error);
    throw error;
  }
}

/**
 * Generate features from SRS using RAG
 * @param {string} projectId - Project identifier
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Generated features
 */
export async function generateFeaturesFromRAG(projectId, options = {}) {
  try {
    const { nContextChunks = 10, model = "gpt-4o-mini" } = options;

    // Search for requirements-related chunks
    const query = "Generate project features and requirements from SRS document";
    const contextChunks = await getRAGContext(projectId, query, nContextChunks);

    if (contextChunks.length === 0) {
      throw new Error("No SRS content found. Please upload SRS document first.");
    }

    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const prompt = `You are a project analyst. Based on the following SRS (Software Requirements Specification) context, generate a comprehensive list of features.

For each feature, provide:
- featureId: unique identifier (format: feature_XXX)
- name: clear feature name
- description: detailed description
- priority: High, Medium, or Low
- status: pending, in_progress, or completed
- acceptanceCriteria: array of acceptance criteria strings

Return ONLY a valid JSON array of features, no additional text.

SRS Context:
${context}

Generate features:`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a project analyst. Return only valid JSON arrays, no markdown or explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Handle both {features: [...]} and [...] formats
    const features = Array.isArray(parsed) ? parsed : parsed.features || [];

    return features;
  } catch (error) {
    console.error("Error generating features from RAG:", error);
    throw error;
  }
}

/**
 * Generate test cases for a feature using RAG
 * @param {string} projectId - Project identifier
 * @param {string} featureDescription - Feature description
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Generated test cases
 */
export async function generateTestCasesFromRAG(projectId, featureDescription, options = {}) {
  try {
    const { nContextChunks = 5, model = "gpt-4o-mini" } = options;

    // Search for relevant requirements
    const contextChunks = await getRAGContext(projectId, featureDescription, nContextChunks);

    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const prompt = `You are a QA engineer. Based on the following feature description and project requirements context, generate comprehensive test cases.

For each test case, provide:
- testCaseId: unique identifier (format: test_XXX)
- title: clear test case title
- description: detailed description
- steps: array of test step strings
- expectedResult: expected outcome
- priority: high, medium, or low
- status: pending, in_progress, passed, failed, or blocked
- preconditions: array of prerequisite conditions (optional)

Return ONLY a valid JSON array of test cases, no additional text.

Feature Description:
${featureDescription}

Project Requirements Context:
${context}

Generate test cases:`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a QA engineer. Return only valid JSON arrays, no markdown or explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Handle both {testCases: [...]} and [...] formats
    const testCases = Array.isArray(parsed) ? parsed : parsed.testCases || [];

    return testCases;
  } catch (error) {
    console.error("Error generating test cases from RAG:", error);
    throw error;
  }
}

/**
 * Analyze bug using RAG to find related requirements
 * @param {string} projectId - Project identifier
 * @param {string} bugDescription - Bug description
 * @returns {Promise<Object>} Bug analysis with related requirements
 */
export async function analyzeBugWithRAG(projectId, bugDescription) {
  try {
    const contextChunks = await getRAGContext(projectId, bugDescription, 5);
    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const prompt = `You are a bug analyst. Analyze the following bug description and find related requirements from the project context.

Provide:
- rootCause: likely root cause of the bug
- relatedRequirements: array of requirement IDs or descriptions that relate to this bug
- suggestedFix: suggested fix or workaround

Return ONLY valid JSON, no additional text.

Bug Description:
${bugDescription}

Project Requirements Context:
${context}

Analyze bug:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a bug analyst. Return only valid JSON, no markdown or explanations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error analyzing bug with RAG:", error);
    throw error;
  }
}

