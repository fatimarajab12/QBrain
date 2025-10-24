// pages/project-details/components/EmptyState.tsx
import { Sparkles, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFeature: () => void;
}

const EmptyState = ({ onCreateFeature }: EmptyStateProps) => {
  return (
    <Card className="shadow-soft border-border">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-4">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Features Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Get started by creating your first feature for this project. Features help you organize test cases and track testing progress.
          </p>
        </div>
        <Button onClick={onCreateFeature} className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create First Feature
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;