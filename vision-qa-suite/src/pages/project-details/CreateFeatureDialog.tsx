// pages/project-details/CreateFeatureDialog.tsx
import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CreateFeatureDialogProps {
  isCreating: boolean;
  onCreate: (featureData: { name: string; description: string; acceptanceCriteria?: string[] }) => void;
}

const CreateFeatureDialog = ({ isCreating, onCreate }: CreateFeatureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: "", description: "", acceptanceCriteria: [] as string[] });
  const [newCriterion, setNewCriterion] = useState("");

  const handleAddCriterion = () => {
    if (newCriterion.trim() && !newFeature.acceptanceCriteria.includes(newCriterion.trim())) {
      setNewFeature({
        ...newFeature,
        acceptanceCriteria: [...newFeature.acceptanceCriteria, newCriterion.trim()],
      });
      setNewCriterion("");
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setNewFeature({
      ...newFeature,
      acceptanceCriteria: newFeature.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  const handleCreate = async () => {
    if (!newFeature.name.trim()) return;

    await onCreate({
      name: newFeature.name,
      description: newFeature.description,
      acceptanceCriteria: newFeature.acceptanceCriteria.length > 0 ? newFeature.acceptanceCriteria : [],
    });
    setNewFeature({ name: "", description: "", acceptanceCriteria: [] });
    setNewCriterion("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewFeature({ name: "", description: "", acceptanceCriteria: [] });
      setNewCriterion("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Feature
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>Create a new feature to test</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-name">Feature Name *</Label>
            <Input
              id="feature-name"
              placeholder="e.g., User Login"
              value={newFeature.name}
              onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea
              id="feature-description"
              placeholder="Brief description of the feature..."
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
              disabled={isCreating}
              rows={3}
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="space-y-2">
            <Label htmlFor="acceptance-criteria">Acceptance Criteria</Label>
            <div className="flex gap-2">
              <Input
                id="acceptance-criteria"
                placeholder="e.g., User can login successfully"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCriterion();
                  }
                }}
                disabled={isCreating}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCriterion}
                disabled={isCreating || !newCriterion.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {newFeature.acceptanceCriteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newFeature.acceptanceCriteria.map((criterion, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {criterion}
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(index)}
                      className="ml-1 hover:text-destructive"
                      disabled={isCreating}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={handleCreate} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={isCreating || !newFeature.name.trim()}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isCreating ? "Creating..." : "Create Feature"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFeatureDialog;