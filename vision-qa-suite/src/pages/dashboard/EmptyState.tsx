// pages/dashboard/components/EmptyState.tsx
import { FolderKanban, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateProject: () => void;
}

const EmptyState = ({ onCreateProject }: EmptyStateProps) => {
  return (
    <Card className="text-center p-8 border-dashed">
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <FolderKanban className="h-16 w-16 text-muted-foreground/60" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Create your first project to start organizing your testing efforts and tracking progress.
          </p>
        </div>
        <Button onClick={onCreateProject} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;