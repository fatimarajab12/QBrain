// pages/project-details/CreateBugDialog.tsx
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Feature } from "@/types/feature";
import { Bug } from "@/types/bug";

interface CreateBugDialogProps {
  features: Feature[];
  projectId?: string;
  featureId?: string; // If provided, this bug is for a specific feature
  onCreate: (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
  }) => Promise<void>;
  isCreating: boolean;
}

const CreateBugDialog = ({ features, projectId, featureId, onCreate, isCreating }: CreateBugDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    severity: "Medium" as "Low" | "Medium" | "High" | "Critical",
    status: "Open" as "Open" | "In Progress" | "Resolved" | "Closed",
    featureId: featureId || "",
  });

  const handleCreate = async () => {
    if (!newBug.title.trim() || !newBug.featureId) return;

    await onCreate({
      title: newBug.title,
      description: newBug.description,
      featureId: newBug.featureId,
      projectId: projectId,
      severity: newBug.severity,
      status: newBug.status,
    });
    setNewBug({
      title: "",
      description: "",
      severity: "Medium",
      status: "Open",
      featureId: featureId || "",
    });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewBug({
        title: "",
        description: "",
        severity: "Medium",
        status: "Open",
        featureId: featureId || "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Report New Bug</DialogTitle>
          <DialogDescription>Create a new bug report for this project</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title">Title *</Label>
            <Input
              id="bug-title"
              placeholder="Enter bug title"
              value={newBug.title}
              onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-description">Description</Label>
            <Textarea
              id="bug-description"
              placeholder="Describe the bug in detail..."
              value={newBug.description}
              onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
              disabled={isCreating}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bug-severity">Severity</Label>
              <Select
                value={newBug.severity}
                onValueChange={(value: "Low" | "Medium" | "High" | "Critical") => 
                  setNewBug({ ...newBug, severity: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-status">Status</Label>
              <Select
                value={newBug.status}
                onValueChange={(value: "Open" | "In Progress" | "Resolved" | "Closed") => 
                  setNewBug({ ...newBug, status: value })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!featureId && (
            <div className="space-y-2">
              <Label htmlFor="bug-feature">Feature *</Label>
              <Select
                value={newBug.featureId}
                onValueChange={(value) => setNewBug({ ...newBug, featureId: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  {features.map((feature) => (
                    <SelectItem key={feature.id} value={feature.id}>
                      {feature.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleCreate} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={isCreating || !newBug.title.trim() || !newBug.featureId}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isCreating ? "Creating..." : "Create Bug"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBugDialog;