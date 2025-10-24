// pages/project-details/CreateFeatureDialog.tsx
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CreateFeatureDialogProps {
  isCreating: boolean;
  onCreate: (featureData: { name: string; description: string }) => void;
}

const CreateFeatureDialog = ({ isCreating, onCreate }: CreateFeatureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: "", description: "" });

  const handleCreate = async () => {
    if (!newFeature.name.trim()) return;

    await onCreate(newFeature);
    setNewFeature({ name: "", description: "" });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewFeature({ name: "", description: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-primary">
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
          <Button 
            onClick={handleCreate} 
            className="w-full gradient-primary"
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