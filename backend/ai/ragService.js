import { vectorStore } from "../vector/vectorStore.js";
import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
/** */
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
} from "@langchain/core/prompts";

import { getEmbeddings } from "./embeddings.js";
/**
 * 
 Cleans the raw LLM output and extracts only the JSON portion — removing:
- Markdown code blocks
- Extra whitespace
- Random text the LLM may add
 */
function extractJSON(text) {
  if (!text || typeof text !== "string") return text;

  let cleaned = text.trim();

  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = cleaned.match(codeBlockRegex);

  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  return cleaned.trim();
}

function parseJSONSafely(text) {
  try {
    const cleaned = extractJSON(text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parsing error. Original text:", text.substring(0, 200));
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

export async function queryRAG(projectId, question, nResults = 5) {
  try {

    const retriever = await vectorStore.getRetriever(projectId, nResults);

    if (!retriever) {
      return "No relevant information found in the project knowledge base.";
    }

    const llm = new ChatOpenAI({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemTemplate = `You are a helpful AI assistant that answers questions based on the provided context from project documentation.
Only use information from the context provided. If the context doesn't contain relevant information, say so clearly.
Be concise and professional in your response.

Context from project documentation:
{context}`;

    const userTemplate = `Question: {question}

Please provide a helpful answer based on the context above.`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(userTemplate),
      
    ]);

    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt: chatPrompt,
      documentVariableName: "context",
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });

    const result = await retrievalChain.invoke({
      input: question,
    });

    return result.output || result.answer || "Unable to generate response";
  } catch (error) {
    console.error("RAG query error:", error);
    throw error;
  }
}



export async function getRAGContext(projectId, query, nResults = 5) {
  try {
    // Get the similar chunks from the vector store
    // nResults is the number of similar chunks to return
    const similarChunks = await vectorStore.similaritySearch(
      projectId,
      query,
      nResults
    );

    return similarChunks.map((chunk) => ({
      text: chunk.content,
      metadata: chunk.metadata,
      relevance: 1 - chunk.score,
    }));
  } catch (error) {
    console.error("Error getting RAG context:", error);
    throw error;
  }
}

export async function generateFeaturesFromRAG(projectId, options = {}) {
  try {
    // Ensure options is an object
    const safeOptions = options && typeof options === 'object' ? options : {};
    const { nContextChunks = 10, model = "gpt-4o-mini" } = safeOptions;
/**
 Input: "requirements features specifications"
This is the search query used to retrieve relevant context from the SRS.
Why this text?
Because when generating features, the most relevant SRS content is usually related to:
requirements
features
specifications
“Find me the chunks in the SRS that best match these keywords.”
 */
    const contextChunks = await getRAGContext(
      projectId,
      "requirements features specifications",
      nContextChunks
    );

    if (contextChunks.length === 0) {
      throw new Error("No SRS content found. Please upload SRS document first.");
    }

    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const llm = new ChatOpenAI({
      model: model,
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(`You are a project analyst. Based on the following SRS (Software Requirements Specification) context, generate a comprehensive list of features.

For each feature, provide:
- featureId: unique identifier (format: feature_XXX)
- name: clear feature name
- description: detailed description
- priority: High, Medium, or Low
- status: pending, in_progress, or completed
- acceptanceCriteria: array of acceptance criteria strings

IMPORTANT: Return ONLY a valid JSON array, no markdown code blocks, no explanations, no additional text. Start with [ and end with ].

SRS Context:
{context}

Generate features as JSON array:`);

    const formattedPrompt = await prompt.format({ context });
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);

    const features = Array.isArray(parsed) ? parsed : parsed.features || [];

    return features;
  } catch (error) {
    console.error("Error generating features from RAG:", error);
    throw error;
  }
}

export async function generateTestCasesFromRAG(
  projectId,
  featureDescription,
  options = {}
) {
  try {
    // Ensure options is an object
    const safeOptions = options && typeof options === 'object' ? options : {};
    const { nContextChunks = 5, model = "gpt-4o-mini" } = safeOptions;

    const contextChunks = await getRAGContext(
      projectId,
      featureDescription,
      nContextChunks
    );

    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const llm = new ChatOpenAI({
      model: model,
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(`You are a QA engineer. Based on the following feature description and project requirements context, generate comprehensive test cases.

For each test case, provide:
- testCaseId: unique identifier (format: test_XXX)
- title: clear test case title
- description: detailed description
- steps: array of test step strings
- expectedResult: expected outcome
- priority: high, medium, or low
- status: pending, in_progress, passed, failed, or blocked
- preconditions: array of prerequisite conditions (optional)

IMPORTANT: Return ONLY a valid JSON array, no markdown code blocks, no explanations, no additional text. Start with [ and end with ].

Feature Description:
{featureDescription}

Project Requirements Context:
{context}

Generate test cases as JSON array:`);

    const formattedPrompt = await prompt.format({
      featureDescription,
      context,
    });
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);

    const testCases = Array.isArray(parsed) ? parsed : parsed.testCases || [];

    return testCases;
  } catch (error) {
    console.error("Error generating test cases from RAG:", error);
    throw error;
  }
}

export async function analyzeBugWithRAG(projectId, bugDescription) {
  try {
    const contextChunks = await getRAGContext(projectId, bugDescription, 5);
    const context = contextChunks.map((chunk) => chunk.text).join("\n\n");

    const llm = new ChatOpenAI({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate(`You are a bug analyst. Analyze the following bug description and find related requirements from the project context.

Provide:
- rootCause: likely root cause of the bug
- relatedRequirements: array of requirement IDs or descriptions that relate to this bug
- suggestedFix: suggested fix or workaround

IMPORTANT: Return ONLY valid JSON object, no markdown code blocks, no explanations, no additional text. Start with { and end with }.

Bug Description:
{bugDescription}

Project Requirements Context:
{context}

Analyze bug:`);

    const formattedPrompt = await prompt.format({
      bugDescription,
      context,
    });
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    return parseJSONSafely(content);
  } catch (error) {
    console.error("Error analyzing bug with RAG:", error);
    throw error;
  }
}