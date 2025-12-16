/**
 * AI Config - Model Defaults
 *
 * Central place to define default model names for LLM and embeddings.
 * This file is currently not wired into existing code to avoid any
 * behavior change, but can be used by new code going forward.
 */

export const DEFAULT_CHAT_MODEL =
  process.env.OPENAI_MODEL || "gpt-4o-mini";

export const DEFAULT_ANALYSIS_MODEL =
  process.env.OPENAI_ANALYSIS_MODEL || "gpt-4o";

export const DEFAULT_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";


