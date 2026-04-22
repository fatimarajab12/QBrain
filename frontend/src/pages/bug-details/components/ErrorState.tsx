import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error?: Error | null;
  projectId?: string;
  onBack: () => void;
}

export const ErrorState = ({ error, onBack }: ErrorStateProps) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Bug Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : "The bug you're looking for doesn't exist."}
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bugs
        </Button>
      </div>
    </div>
  );
};

