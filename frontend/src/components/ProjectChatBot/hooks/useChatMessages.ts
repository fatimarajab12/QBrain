import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Message } from "../types";
import { useChatApi } from "./useChatApi";

export const useChatMessages = (projectId: string, projectName?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, cancelRequest, cleanup } = useChatApi(projectId);

  const initialMessage = useMemo<Message>(() => ({
    id: 1,
    text: `Hello! I'm your AI assistant for ${projectName || "this project"}. Ask me anything about the project features, test cases, or requirements!`,
    sender: "bot",
    timestamp: new Date(),
  }), [projectName]);

  // Initialize messages
  useEffect(() => {
    setMessages([initialMessage]);
  }, [initialMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    let updatedMessages: Message[] = [];
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage];
      return updatedMessages;
    });

    try {
      const answer = await sendMessage(question, updatedMessages);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: answer,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      // Don't show error if request was cancelled
      if (error.message.includes('cancelled')) {
        setIsLoading(false);
        return;
      }

      console.error('Error querying Chat Bot:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: error.message || 'Failed to get response',
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sendMessage]);

  const clearChat = useCallback(() => {
    cancelRequest();
    setIsLoading(false);
    setMessages([initialMessage]);
  }, [initialMessage, cancelRequest]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSend,
    clearChat,
  };
};


