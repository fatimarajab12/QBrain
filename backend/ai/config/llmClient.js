/**
 * AI Config - LLM Client Factory
 *
 * Central factory and profiles for creating ChatOpenAI instances
 * with consistent configuration across the codebase.
 */

import { ChatOpenAI } from "@langchain/openai";
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_ANALYSIS_MODEL,
} from "./models.config.js";

/**
 * Low-level factory. Use profiles where possible.
 */
export function createChatModel(options = {}) {
  const {
    model = DEFAULT_CHAT_MODEL,
    temperature = 0.7,
    apiKey = process.env.OPENAI_API_KEY,
    ...rest
  } = options;

  return new ChatOpenAI({
    model,
    temperature,
    apiKey,
    ...rest,
  });
}

/**
 * Recommended profiles for common use cases.
 * These are safe defaults; callers can override any field.
 */
export const LLM_PROFILES = {
  // Used for reasoning / analysis-heavy tasks (section matching, test cases, etc.)
  reasoning: {
    model: DEFAULT_ANALYSIS_MODEL,
    temperature: 0.3,
  },
  // Used for more generative tasks (chat, explanations, etc.)
  generation: {
    model: DEFAULT_CHAT_MODEL,
    temperature: 0.7,
  },
};

/**
 * Convenience wrapper to create a ChatOpenAI instance from a named profile.
 * Caller can override any profile field via the overrides object.
 */
export function createProfiledChatModel(profileName, overrides = {}) {
  const base = LLM_PROFILES[profileName] || {};
  return createChatModel({
    ...base,
    ...overrides,
  });
}
