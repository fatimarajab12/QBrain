import { useState, useRef } from "react";
import { Plus, Upload, FileText, X, FolderPlus } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectDialogProps {
  isCreating: boolean;
  onCreateProject: (projectData: { name: string; description: string }) => Promise<{ _id: string | number }>;
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
      
      if (!createdProject || !createdProject._id) {
        throw new Error('Failed to create project - no ID returned');
      }
      
      // Show success message for project creation
      toast({
        title: "Project Created Successfully",
        description: `Project "${newProject.name}" has been created successfully.`,
      });
      
      // If SRS file is selected and project was created, upload it
      if (selectedFile && createdProject._id) {
        setIsUploadingSRS(true);
        try {
          await projectService.uploadSRS(createdProject._id.toString(), selectedFile);
          toast({
            title: "SRS Uploaded Successfully",
            description: "SRS document has been uploaded and processed successfully.",
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Project created successfully, but SRS upload failed. You can upload it later.";
          toast({
            title: "SRS Upload Failed",
            description: errorMessage,
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create project";
      toast({
        title: "Error",
        description: errorMessage,
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
        <Button
          data-testid="create-project-trigger"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <FolderPlus className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
              <DialogDescription className="text-sm mt-1.5">
                Add a new testing project to track features and test cases
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2.5">
            <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g., POS Store System"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              disabled={isCreating || isUploadingSRS}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              disabled={isCreating || isUploadingSRS}
              rows={4}
              className="resize-none text-base"
            />
          </div>

          {/* SRS Upload Section */}
          <div className="space-y-2.5">
            <Label htmlFor="srs-file" className="text-sm font-semibold">SRS Document <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <div className="space-y-2.5">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="srs-file"
                  className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 border-muted-foreground/25 hover:border-primary/50 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center justify-center pt-3 pb-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-2">
                      <Upload className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-0.5">
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
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
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
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <LoadingButton
              onClick={handleCreate} 
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-200"
              disabled={isUploadingSRS || !newProject.name.trim()}
              isLoading={isCreating || isUploadingSRS}
              loadingText={isUploadingSRS ? "Uploading SRS..." : "Creating..."}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
