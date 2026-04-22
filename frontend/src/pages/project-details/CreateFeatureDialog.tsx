import { useState } from "react";
import { Plus, X } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface CreateFeatureDialogProps {
  isCreating: boolean;
  onCreate: (featureData: { 
    name: string; 
    description: string; 
    priority?: "High" | "Medium" | "Low";
    featureType?: "FUNCTIONAL" | "DATA" | "DATA_MODEL" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
    acceptanceCriteria?: string[];
    reasoning?: string;
  }) => void;
}

const CreateFeatureDialog = ({ isCreating, onCreate }: CreateFeatureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({ 
    name: "", 
    description: "", 
    priority: "Medium" as "High" | "Medium" | "Low",
    featureType: undefined as "FUNCTIONAL" | "DATA" | "DATA_MODEL" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION" | undefined,
    acceptanceCriteria: [] as string[]
  });
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
      priority: newFeature.priority,
      featureType: newFeature.featureType,
      acceptanceCriteria: newFeature.acceptanceCriteria.length > 0 ? newFeature.acceptanceCriteria : undefined,
    });
    setNewFeature({ 
      name: "", 
      description: "", 
      priority: "Medium",
      featureType: undefined,
      acceptanceCriteria: []
    });
    setNewCriterion("");
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewFeature({ 
        name: "", 
        description: "", 
        priority: "Medium",
        featureType: undefined,
        acceptanceCriteria: []
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Priority and Feature Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature-priority">Priority</Label>
              <Select
                value={newFeature.priority}
                onValueChange={(value: "High" | "Medium" | "Low") => 
                  setNewFeature({ ...newFeature, priority: value })
                }
                disabled={isCreating}
              >
                <SelectTrigger id="feature-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="Low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feature-type">Feature Type (Optional)</Label>
              <Select
                value={newFeature.featureType || undefined}
                onValueChange={(value: string) => {
                  // If user selects a value, set it; if they want to clear, we'll handle it differently
                  setNewFeature({ ...newFeature, featureType: value as any });
                }}
                disabled={isCreating}
              >
                <SelectTrigger id="feature-type">
                  <SelectValue placeholder="Select type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUNCTIONAL">Functional</SelectItem>
                  <SelectItem value="DATA">Data</SelectItem>
                  <SelectItem value="DATA_MODEL">Data Model</SelectItem>
                  <SelectItem value="WORKFLOW">Workflow</SelectItem>
                  <SelectItem value="QUALITY">Quality</SelectItem>
                  <SelectItem value="INTERFACE">Interface</SelectItem>
                  <SelectItem value="REPORT">Report</SelectItem>
                  <SelectItem value="CONSTRAINT">Constraint</SelectItem>
                  <SelectItem value="NOTIFICATION">Notification</SelectItem>
                </SelectContent>
              </Select>
              {newFeature.featureType && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => setNewFeature({ ...newFeature, featureType: undefined })}
                  disabled={isCreating}
                >
                  Clear selection
                </Button>
              )}
            </div>
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


          <LoadingButton
            onClick={handleCreate} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={!newFeature.name.trim()}
            isLoading={isCreating}
            loadingText="Creating..."
          >
            Create Feature
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFeatureDialog;
