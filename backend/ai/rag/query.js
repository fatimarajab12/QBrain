/**
 * RAG Layer - Query Module
 *
 * Handles high-level RAG queries for answering user questions based on
 * project SRS context. This is the canonical implementation used by
 * the RAG API entry in ./index.js.
 */

import { vectorStore } from "../../vector/vectorStore.js";
import { createChatModel } from "../config/llmClient.js";
import { DEFAULT_CHAT_MODEL } from "../config/models.config.js";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { expandQuery } from "../../utils/textProcessing.js";

/**
 * Queries RAG system with a question
 */
export async function queryRAG(projectId, question, nResults = 5) {
  try {
    // Expand query with related terms for better retrieval
    const expandedQuestion = expandQuery(question);

    const retriever = await vectorStore.getRetriever(projectId, nResults);

    if (!retriever) {
      return "No relevant information found in the project knowledge base.";
    }

    // Use shared LLM factory to keep configuration in one place
    const llm = createChatModel({
      // Preserve existing behavior: prefer explicit env model, then default chat model
      model: process.env.OPENAI_MODEL || DEFAULT_CHAT_MODEL,
      temperature: 0.7,
    });

    const systemTemplate = `You are a helpful AI assistant that answers questions based on the provided context from project documentation (SRS - Software Requirements Specification).

**CRITICAL RULES:**
1. You MUST answer ONLY using the provided SRS context
2. Cite section numbers when relevant (e.g., "As per section 3.2.1...")
3. If the answer is not in the context, say "Not in SRS" clearly
4. Be concise and professional in your response
5. The SRS is structured into sections like 3.2.1, 3.2.1.1, etc.
6. Prefer referencing higher-level sections if user asks a general question

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
      input: expandedQuestion,
    });

    return result.output || result.answer || "Unable to generate response";
  } catch (error) {
    console.error("RAG query error:", error);
    throw error;
  }
}


