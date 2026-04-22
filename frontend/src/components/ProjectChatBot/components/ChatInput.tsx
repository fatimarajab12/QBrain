import { Send } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const ChatInput = ({ input, setInput, isLoading, onSend, inputRef }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about features, test cases, requirements..."
            disabled={isLoading}
            className="text-sm sm:text-base font-normal leading-relaxed tracking-wide font-sans pr-12 min-h-[44px] border-2 focus:border-cyan-500/50 transition-colors"
            aria-label="Chat input"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {input.length > 0 && `${input.length} chars`}
          </div>
        </div>
        <Button
          onClick={onSend}
          disabled={isLoading || input.trim() === ""}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 flex-shrink-0 h-[44px] w-[44px] shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          size="icon"
          aria-label="Send message"
        >
          {isLoading ? (
            <LoadingSpinner size="md" variant="gradient" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

