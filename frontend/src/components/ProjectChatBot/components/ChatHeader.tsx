import { X, Sparkles, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface ChatHeaderProps {
  projectName?: string;
  onClose: () => void;
  onClear: () => void;
  onExpand?: () => void;
  showExpandButton?: boolean;
}

export const ChatHeader = ({ projectName, onClose, onClear, onExpand, showExpandButton = false }: ChatHeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 px-3 sm:px-6">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold truncate tracking-tight">
            AI Assistant
          </CardTitle>
          <p className="text-xs text-muted-foreground truncate font-medium">
            {projectName || "Project Chat"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {showExpandButton && onExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
            title="Open in full page"
            aria-label="Open in full page"
          >
            <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs hover:bg-muted"
          title="Clear chat"
          aria-label="Clear chat"
        >
          <span className="hidden sm:inline">Clear</span>
          <span className="sm:hidden text-[10px]">C</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-full"
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </CardHeader>
  );
};

