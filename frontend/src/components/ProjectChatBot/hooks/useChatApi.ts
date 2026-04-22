import { useRef, useCallback } from "react";
import { Message, ChatApiResponse } from "../types";
import { CHAT_CONFIG, getApiBaseUrl } from "../constants";

export const useChatApi = (projectId: string) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    question: string,
    conversationHistory: Message[]
  ): Promise<string> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const historyForApi = conversationHistory
        .slice(-CHAT_CONFIG.MAX_HISTORY_MESSAGES)
        .map(msg => ({
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp.toISOString(),
        }));

      const response = await fetch(`${getApiBaseUrl()}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        signal: abortController.signal,
        body: JSON.stringify({
          projectId,
          question,
          history: historyForApi,
          nResults: CHAT_CONFIG.N_RESULTS,
        }),
      });

      if (abortController.signal.aborted) {
        throw new Error('Request cancelled');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get AI response');
      }

      const result: ChatApiResponse = await response.json();

      if (abortController.signal.aborted) {
        throw new Error('Request cancelled');
      }

      if (result.success && result.data?.answer) {
        return result.data.answer;
      }

      throw new Error("I'm sorry, I couldn't process your question. Please try again.");
    } catch (error: any) {
      if (error.message === 'Request cancelled') {
        throw error;
      }
      throw new Error(
        `Sorry, I encountered an error: ${error.message || 'Failed to get response'}. Please make sure your project has an SRS document uploaded.`
      );
    } finally {
      abortControllerRef.current = null;
    }
  }, [projectId]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    sendMessage,
    cancelRequest,
    cleanup,
  };
};

