import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatButton = ({ onClick, isOpen }: ChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "!fixed !bottom-6 !right-6 sm:!bottom-8 sm:!right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl z-[9999]",
        "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
        "text-white border-0 transition-all duration-300",
        "hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50",
        "active:scale-95",
        isOpen && "hidden"
      )}
      size="icon"
      aria-label="Open chat"
    >
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  );
};


