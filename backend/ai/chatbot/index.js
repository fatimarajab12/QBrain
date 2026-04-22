/**
 * Chat Bot API - Unified Entry Point
 *
 * This module exposes all Chat Bot related capabilities.
 * Completely separate from the general RAG/Reasoning modules.
 */

// Query functions
export { queryChatBot, getChatBotContext } from "./query.js";

// Utilities
export { 
  formatChatHistory, 
  extractHistoryKeywords, 
  validateHistory,
  expandQueryForChatBot,
  createQueryVariations,
} from "./utils.js";

// Prompts
export { 
  CHATBOT_SYSTEM_PROMPT, 
  CHATBOT_USER_PROMPT, 
  CHATBOT_USER_PROMPT_WITH_HISTORY 
} from "./prompts.js";

