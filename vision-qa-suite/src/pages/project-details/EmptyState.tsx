// pages/project-details/components/EmptyState.tsx
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateFeature: () => void;
}

const EmptyState = ({ onCreateFeature }: EmptyStateProps) => {
  return (
    <Card className="shadow-soft border-border">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">No Features Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Get started by creating your first feature manually.
          </p>
        </div>
        <Button onClick={onCreateFeature} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;