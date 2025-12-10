// pages/dashboard/components/CreateProjectDialog.tsx
import { useState, useRef } from "react";
import { Plus, Loader2, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectDialogProps {
  isCreating: boolean;
  onCreateProject: (projectData: { name: string; description: string }) => Promise<{ id: string | number } | void>;
}

const CreateProjectDialog = ({ isCreating, onCreateProject }: CreateProjectDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingSRS, setIsUploadingSRS] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'text/plain'];
      const validExtensions = ['.pdf', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or TXT file only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create project first
      const createdProject = await onCreateProject(newProject);
      
      if (!createdProject?.id) {
        throw new Error('Failed to create project - no ID returned');
      }
      
      // Show success message for project creation
      toast({
        title: "Project Created Successfully",
        description: `Project "${newProject.name}" has been created successfully.`,
      });
      
      // If SRS file is selected and project was created, upload it
      if (selectedFile && createdProject.id) {
        setIsUploadingSRS(true);
        try {
          await projectService.uploadSRS(createdProject.id.toString(), selectedFile);
          toast({
            title: "SRS Uploaded Successfully",
            description: "SRS document has been uploaded and processed successfully.",
          });
        } catch (error: any) {
          console.error('Error uploading SRS:', error);
          toast({
            title: "SRS Upload Failed",
            description: error.message || "Project created successfully, but SRS upload failed. You can upload it later.",
            variant: "default",
          });
        } finally {
          setIsUploadingSRS(false);
        }
      }

      // Reset form
      setNewProject({ name: "", description: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNewProject({ name: "", description: "" });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25">
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
              disabled={isCreating || isUploadingSRS}
              rows={3}
            />
          </div>

          {/* SRS Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="srs-file">SRS Document (Optional)</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="srs-file"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF or TXT (up to 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="srs-file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt"
                    onChange={handleFileSelect}
                    disabled={isCreating || isUploadingSRS}
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isCreating || isUploadingSRS}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={handleCreate} 
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={isCreating || isUploadingSRS || !newProject.name.trim()}
          >
            {isCreating || isUploadingSRS ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isUploadingSRS ? "Uploading SRS..." : isCreating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;