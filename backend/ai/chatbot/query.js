/**
 * Chat Bot Query Module
 * 
 * Main logic for Chat Bot RAG queries with conversation history support.
 */

import { vectorStore } from "../../vector/vectorStore.js";
import { createChatModel } from "../config/llmClient.js";
import { DEFAULT_CHAT_MODEL } from "../config/models.config.js";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { 
  expandQueryForChatBot, 
  createQueryVariations,
  formatChatHistory,
  validateHistory,
} from "./utils.js";
import { CHATBOT_SYSTEM_PROMPT, CHATBOT_USER_PROMPT, CHATBOT_USER_PROMPT_WITH_HISTORY } from "./prompts.js";
import { COMPREHENSIVE_SRS_QUERIES } from "../config/constants.js";


/**
 * Detect question type for dynamic temperature selection
 */
function detectQuestionType(question, history = []) {
  const questionLower = question.toLowerCase();
  const combinedText = [question, ...history.slice(-3).map(h => h.text || '')]
    .join(' ')
    .toLowerCase();
  
  // Precise/technical questions - lower temperature
  const precisePatterns = [
    'feature', 'requirement', 'test case', 'workflow step',
    'what is', 'list', 'show me', 'give me', 'specify',
    'exact', 'specific', 'detailed', 'precise'
  ];
  
  // Explanatory/general questions - higher temperature
  const explanatoryPatterns = [
    'explain', 'how does', 'why', 'describe', 'tell me about',
    'understand', 'help me', 'can you', 'what does'
  ];
  
  const isPrecise = precisePatterns.some(pattern => combinedText.includes(pattern));
  const isExplanatory = explanatoryPatterns.some(pattern => combinedText.includes(pattern));
  
  if (isPrecise && !isExplanatory) return 'precise';
  if (isExplanatory && !isPrecise) return 'explanatory';
  return 'balanced';
}

/**
 * Get dynamic temperature based on question type
 * Default: 0.8 for natural, friendly conversation
 */
function getDynamicTemperature(question, history = [], defaultTemp = 0.8) {
  const questionType = detectQuestionType(question, history);
  
  switch (questionType) {
    case 'precise':
      return 0.6; // Slightly lower for more accurate answers, but still natural
    case 'explanatory':
      return 0.8; // Higher temperature for more natural, conversational answers
    default:
      return defaultTemp; // Default 0.8 for balanced, friendly responses
  }
}

/**
 * Detect category from question for weighted retrieval
 */
function detectCategoryForWeight(question) {
  const questionLower = question.toLowerCase();
  
  // Check against COMPREHENSIVE_SRS_QUERIES categories
  for (const queryConfig of COMPREHENSIVE_SRS_QUERIES) {
    const keywords = queryConfig.query.split(' ');
    if (keywords.some(kw => questionLower.includes(kw))) {
      return queryConfig.category;
    }
  }
  return null;
}

/**
 * Queries RAG system with conversation history support
 * Improved: Multi-query variations, weighted retrieval, dynamic temperature, better document handling
 */
export async function queryChatBot(projectId, question, nResults = 5, history = [], options = {}) {
  try {
    const validHistory = validateHistory(history) ? history : [];
    
    // Detect category for better retrieval
    const category = detectCategoryForWeight(question);
    
    // Create query variations for multi-query retrieval (better coverage)
    const queryVariations = createQueryVariations(question, validHistory, category);
    
    // Use base retriever directly
    const retriever = await vectorStore.getRetriever(projectId, nResults * 2); // Get more results for deduplication
    
    if (!retriever) {
      return "No relevant information found in the project knowledge base. Please ensure the SRS document has been uploaded.";
    }
    
    // Multi-query retrieval: retrieve documents for each query variation
    const allDocs = [];
    const docMap = new Map(); // For deduplication
    
    for (const queryVar of queryVariations.slice(0, 3)) { // Limit to top 3 variations to avoid too many calls
      try {
        const docs = await retriever.getRelevantDocuments(queryVar);
        if (Array.isArray(docs)) {
          docs.forEach((doc, index) => {
            // Use first 100 chars as hash for deduplication
            const textHash = (doc.pageContent || '').substring(0, 100).toLowerCase();
            if (!docMap.has(textHash)) {
              // Calculate base relevance from position (earlier = more relevant)
              // LangChain retrievers return documents in relevance order
              const positionRelevance = 1 - (index / Math.max(docs.length, 1)) * 0.3; // 0.7 to 1.0 range
              
              docMap.set(textHash, {
                ...doc,
                _baseRelevance: positionRelevance, // Store for later use
                _queryVariation: queryVar, // Track which variation found this
              });
              allDocs.push({
                ...doc,
                _baseRelevance: positionRelevance,
                _queryVariation: queryVar,
              });
            } else {
              // If duplicate found, keep the one with higher relevance
              const existing = docMap.get(textHash);
              const positionRelevance = 1 - (index / Math.max(docs.length, 1)) * 0.3;
              if (positionRelevance > (existing._baseRelevance || 0.5)) {
                docMap.set(textHash, {
                  ...doc,
                  _baseRelevance: positionRelevance,
                  _queryVariation: queryVar,
                });
              }
            }
          });
        }
      } catch (err) {
        console.warn(`[ChatBot] Error retrieving for variation "${queryVar}":`, err.message);
      }
    }
    
    if (allDocs.length === 0) {
      return "No relevant information found in the project knowledge base. Please ensure the SRS document has been uploaded.";
    }
    
    // Apply category-based weighting to documents (similar to getComprehensiveRAGContext)
    let weightedDocs = allDocs.map(doc => {
      // Calculate base relevance (from position, metadata, or default)
      const baseRelevance = doc._baseRelevance || doc.metadata?.relevance || 0.7;
      
      // Find matching category and apply weight
      let weight = 1.0;
      if (category) {
        const categoryConfig = COMPREHENSIVE_SRS_QUERIES.find(q => q.category === category);
        if (categoryConfig) {
          weight = categoryConfig.weight;
          
          // Boost relevance if document contains category keywords
          const docContent = (doc.pageContent || '').toLowerCase();
          const categoryKeywords = categoryConfig.query.split(' ');
          const keywordMatches = categoryKeywords.filter(kw => docContent.includes(kw)).length;
          const boost = Math.min(keywordMatches * 0.1, 0.3); // Max 0.3 boost
          weight = weight + boost;
        }
      }
      
      // Priority boost: High Priority documents get higher relevance
      let priorityBoost = 0;
      const priority = doc.metadata?.priority?.toLowerCase();
      if (priority === 'high' || priority === 'high priority') {
        priorityBoost = 0.2; // Significant boost for high priority
      } else if (priority === 'medium' || priority === 'medium priority') {
        priorityBoost = 0.1;
      }
      
      // Calculate adjusted relevance (like in getComprehensiveRAGContext)
      const adjustedRelevance = baseRelevance * weight + priorityBoost;
      
      return {
        ...doc,
        adjustedRelevance,
        category: category || null,
        priority: priority || null,
      };
    });
    
    // Sort by adjusted relevance, criticality, and priority
    // Critical tests (e.g., notification sending, payment verification) should appear first
    weightedDocs.sort((a, b) => {
      // First sort by adjusted relevance
      const relevanceDiff = (b.adjustedRelevance || 0) - (a.adjustedRelevance || 0);
      if (Math.abs(relevanceDiff) > 0.15) {
        return relevanceDiff;
      }
      
      // Check for critical test cases (tests that verify core functionality)
      const isCriticalTest = (doc) => {
        const content = (doc.pageContent || '').toLowerCase();
        const criticalKeywords = [
          'verify', 'confirm', 'ensure', 'validate',
          'notification is sent', 'payment is processed', 'data is saved',
          'must be sent', 'must be received', 'must be verified'
        ];
        return criticalKeywords.some(keyword => content.includes(keyword));
      };
      
      const aIsCritical = isCriticalTest(a);
      const bIsCritical = isCriticalTest(b);
      
      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;
      
      // Then sort by priority (High > Medium > Low > null)
      const priorityOrder = { 'high': 3, 'high priority': 3, 'medium': 2, 'medium priority': 2, 'low': 1, 'low priority': 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      return bPriority - aPriority;
    });
    
    // Take top nResults after weighting
    weightedDocs = weightedDocs.slice(0, nResults);
    
    // Temperature: default 0.8 for natural conversation, but allow dynamic adjustment
    const temperature = options.temperature !== undefined 
      ? options.temperature 
      : (options.useDynamicTemperature !== false 
          ? getDynamicTemperature(question, validHistory) 
          : 0.8); // Default to 0.8 for natural, friendly responses
    
    const llm = createChatModel({
      model: options.model || process.env.OPENAI_MODEL || DEFAULT_CHAT_MODEL,
      temperature: temperature,
    });
    
    // Category-aware history formatting
    const historyText = formatChatHistory(validHistory, 10, category);
    const userTemplate = historyText 
      ? CHATBOT_USER_PROMPT_WITH_HISTORY
      : CHATBOT_USER_PROMPT;
    
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(CHATBOT_SYSTEM_PROMPT),
      HumanMessagePromptTemplate.fromTemplate(userTemplate),
    ]);
    
    // Build context from weighted documents
    // Include comprehensive metadata for better traceability and accuracy
    const context = weightedDocs.map((doc, index) => {
      const metadataParts = [];
      
      // Section reference (most important for traceability)
      if (doc.metadata?.section) {
        metadataParts.push(`Section: ${doc.metadata.section}`);
      }
      
      // Section number if available
      if (doc.metadata?.sectionNumber) {
        metadataParts.push(`Section Number: ${doc.metadata.sectionNumber}`);
      }
      
      // Feature ID and name if available
      if (doc.metadata?.featureId) {
        metadataParts.push(`Feature ID: ${doc.metadata.featureId}`);
      }
      if (doc.metadata?.featureName) {
        metadataParts.push(`Feature: ${doc.metadata.featureName}`);
      }
      
      // Priority information (important for test cases ordering)
      if (doc.metadata?.priority) {
        metadataParts.push(`Priority: ${doc.metadata.priority}`);
      }
      
      // Status if available
      if (doc.metadata?.status) {
        metadataParts.push(`Status: ${doc.metadata.status}`);
      }
      
      // Category reference
      if (doc.category) {
        metadataParts.push(`Category: ${doc.category}`);
      }
      
      // Test case ID if available
      if (doc.metadata?.testCaseId) {
        metadataParts.push(`Test Case ID: ${doc.metadata.testCaseId}`);
      }
      
      // Test case title if available (for better context)
      if (doc.metadata?.testCaseTitle) {
        metadataParts.push(`Test Case: ${doc.metadata.testCaseTitle}`);
      }
      
      // Acceptance criteria ID if available
      if (doc.metadata?.acceptanceCriteriaId) {
        metadataParts.push(`Acceptance Criteria ID: ${doc.metadata.acceptanceCriteriaId}`);
      }
      
      // Build metadata header with clear formatting
      const metadataHeader = metadataParts.length > 0 
        ? `[${metadataParts.join(' | ')}]\n` 
        : '';
      
      return `${metadataHeader}${doc.pageContent}`;
    }).join("\n\n");
    
    // Build input for prompt
    const promptInput = {
      context,
      question,
    };
    
    if (historyText) {
      promptInput.history = historyText;
    }
    
    // Use LLM directly with the prompt
    const response = await llm.invoke(await chatPrompt.format(promptInput));
    
    return response.content || response.text || "Unable to generate response";
  } catch (error) {
    console.error("[ChatBot] Query error:", error);
    throw error;
  }
}

/**
 * Get context chunks for a query (for debugging or advanced use)
 * Improved: Category-aware, weighted results, section references
 */
export async function getChatBotContext(projectId, query, nResults = 5, history = []) {
  try {
    const validHistory = validateHistory(history) ? history : [];
    const category = detectCategoryForWeight(query);
    const retriever = await vectorStore.getRetriever(projectId, nResults);
    
    if (!retriever) {
      return [];
    }
    
    const expandedQuery = expandQueryForChatBot(query, validHistory, category);
    const documents = await retriever.getRelevantDocuments(expandedQuery);
    
    // Convert to simple format for response
    if (!Array.isArray(documents)) {
      return [];
    }
    
    // Apply category-based weighting
    let weightedDocs = documents;
    let categoryConfig = null;
    if (category) {
      categoryConfig = COMPREHENSIVE_SRS_QUERIES.find(q => q.category === category);
      if (categoryConfig) {
        weightedDocs = documents.sort((a, b) => {
          const aContent = (a.pageContent || '').toLowerCase();
          const bContent = (b.pageContent || '').toLowerCase();
          const categoryKeywords = categoryConfig.query.split(' ');
          
          const aScore = categoryKeywords.filter(kw => aContent.includes(kw)).length;
          const bScore = categoryKeywords.filter(kw => bContent.includes(kw)).length;
          
          return bScore - aScore;
        });
      }
    }
    
    return weightedDocs.map((doc, index) => ({
      index: index + 1,
      content: doc.pageContent || "",
      metadata: doc.metadata || {},
      section: doc.metadata?.section || null,
      category: category || null,
      relevanceScore: categoryConfig ? categoryConfig.weight : 1.0
    }));
  } catch (error) {
    console.error("[ChatBot] Context retrieval error:", error);
    throw error;
  }
}

