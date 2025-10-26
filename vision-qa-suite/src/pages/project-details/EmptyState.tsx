// pages/project-details/components/EmptyState.tsx
import { Sparkles, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFeature: () => void;
  onGenerateWithAI: () => void;
}

const EmptyState = ({ onCreateFeature, onGenerateWithAI }: EmptyStateProps) => {
  return (
    <Card className="shadow-soft border-border">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-6">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Features Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Get started by creating your first feature manually or generate features automatically using AI.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onGenerateWithAI} className="gradient-ai">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
          <Button onClick={onCreateFeature} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;