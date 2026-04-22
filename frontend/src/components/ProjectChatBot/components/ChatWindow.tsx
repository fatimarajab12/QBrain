import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Message } from "../types";
import { CHAT_STYLES } from "../constants";

interface ChatWindowProps {
  projectName?: string;
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
  onClear: () => void;
  onSend: () => void;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

export const ChatWindow = ({
  projectName,
  messages,
  isLoading,
  input,
  setInput,
  messagesEndRef,
  inputRef,
  onClose,
  onClear,
  onSend,
  onExpand,
  showExpandButton = false,
}: ChatWindowProps) => {
  return (
    <>
      {/* Overlay - Click outside to close */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="!fixed !bottom-6 !right-6 sm:!bottom-8 sm:!right-8 w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-md h-[calc(100vh-10rem)] sm:h-[650px] max-h-[calc(100vh-10rem)] sm:max-h-[650px] z-[9999] animate-in slide-in-from-bottom-5 duration-300"
      >
        <Card className="h-full flex flex-col shadow-2xl border-2 border-cyan-500/30 relative bg-card/95 backdrop-blur-sm">
          {/* Close Button - Top Right Corner */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-border shadow-lg hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all z-10"
            title="Close chat"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>

          <ChatHeader 
            projectName={projectName} 
            onClose={onClose} 
            onClear={onClear}
            onExpand={onExpand}
            showExpandButton={showExpandButton}
          />
          <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          <ChatInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={onSend}
            inputRef={inputRef}
          />
        </Card>
      </div>
    </>
  );
};

