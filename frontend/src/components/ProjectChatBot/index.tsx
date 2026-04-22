import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChatButton } from "./components/ChatButton";
import { ChatWindow } from "./components/ChatWindow";
import { useChatMessages } from "./hooks/useChatMessages";
import { ProjectChatBotProps } from "./types";
import { CHAT_CONFIG } from "./constants";

const ProjectChatBot = ({ projectId, projectName }: ProjectChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSend,
    clearChat,
  } = useChatMessages(projectId, projectName);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, CHAT_CONFIG.INPUT_FOCUS_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleExpand = useCallback(() => {
    navigate(`/projects/${projectId}/chat`);
  }, [navigate, projectId]);

  return (
    <>
      <ChatButton onClick={toggleOpen} isOpen={isOpen} />

      {isOpen && (
        <ChatWindow
          projectName={projectName}
          messages={messages}
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          onClose={closeChat}
          onClear={clearChat}
          onSend={handleSend}
          onExpand={handleExpand}
          showExpandButton={true}
        />
      )}
    </>
  );
};

export default ProjectChatBot;

