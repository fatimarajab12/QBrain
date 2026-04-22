import { Bot, User, Copy, Check } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { Message } from "../types";
import { useToast } from "@/hooks/use-toast";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList = ({ messages, isLoading, messagesEndRef }: MessageListProps) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  return (
    <CardContent className="flex-1 p-0 flex flex-col min-h-0">
      <ScrollArea className="flex-1 p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-5">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <p className="text-muted-foreground">Start a conversation with the AI assistant</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 sm:gap-4 group",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "bot" && (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 relative group/message",
                    message.sender === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                      : "bg-muted text-foreground border border-border/50"
                  )}
                >
                  <p className="text-sm sm:text-base font-normal leading-relaxed tracking-wide whitespace-pre-wrap break-words font-sans antialiased chat-message">
                    {message.text}
                  </p>
                  
                  {/* Copy Button - appears on hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover/message:opacity-100 transition-opacity",
                      message.sender === "user" 
                        ? "bg-white/20 hover:bg-white/30 text-white" 
                        : "bg-background/80 hover:bg-background"
                    )}
                    onClick={() => handleCopy(message.text, message.id)}
                    title="Copy message"
                  >
                    {copiedId === message.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <p className={cn(
                  "text-[10px] sm:text-xs opacity-60 px-1",
                  message.sender === "user" ? "text-right" : "text-left"
                )}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-2 border border-border/50">
                <LoadingSpinner size="sm" variant="gradient" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </CardContent>
  );
};

