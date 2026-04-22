import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Feature } from "@/types/feature";

interface EditFeatureDialogProps {
  feature: Feature;
  isUpdating: boolean;
  onUpdate: (featureId: string, featureData: { name: string; description: string }) => Promise<void>;
}

const EditFeatureDialog = ({ feature, isUpdating, onUpdate }: EditFeatureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedFeature, setEditedFeature] = useState({ name: feature.name, description: feature.description });

  // Update form when feature changes
  useEffect(() => {
    setEditedFeature({ name: feature.name, description: feature.description });
  }, [feature]);

  const handleUpdate = async () => {
    if (!editedFeature.name.trim()) return;

    await onUpdate(feature._id, editedFeature);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to original values when closing
      setEditedFeature({ name: feature.name, description: feature.description });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Feature</DialogTitle>
          <DialogDescription>Update feature details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-feature-name">Feature Name *</Label>
            <Input
              id="edit-feature-name"
              placeholder="e.g., User Login"
              value={editedFeature.name}
              onChange={(e) => setEditedFeature({ ...editedFeature, name: e.target.value })}
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-feature-description">Description</Label>
            <Textarea
              id="edit-feature-description"
              placeholder="Brief description of the feature..."
              value={editedFeature.description}
              onChange={(e) => setEditedFeature({ ...editedFeature, description: e.target.value })}
              disabled={isUpdating}
              rows={3}
            />
          </div>
          <LoadingButton
            onClick={handleUpdate} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={!editedFeature.name.trim()}
            isLoading={isUpdating}
            loadingText="Updating..."
          >
            Update Feature
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFeatureDialog;

