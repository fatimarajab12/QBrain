// pages/dashboard/components/CreateProjectDialog.tsx
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CreateProjectDialogProps {
  isCreating: boolean;
  onCreateProject: (projectData: { name: string; description: string }) => void;
}

const CreateProjectDialog = ({ isCreating, onCreateProject }: CreateProjectDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;

    await onCreateProject(newProject);
    setNewProject({ name: "", description: "" });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewProject({ name: "", description: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Add a new testing project to track features and test cases</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="e.g., POS Store System"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              disabled={isCreating}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="w-full gradient-primary"
            disabled={isCreating || !newProject.name.trim()}
          >
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;