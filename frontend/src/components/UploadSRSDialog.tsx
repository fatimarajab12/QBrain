// components/UploadSRSDialog.tsx
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle2, X } from "lucide-react";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

interface UploadSRSDialogProps {
  projectId: string;
  onUploadSuccess?: (fileName?: string) => void;
  hasSRS?: boolean;
  srsFileName?: string;
}

export default function UploadSRSDialog({ 
  projectId, 
  onUploadSuccess,
  hasSRS = false,
  srsFileName 
}: UploadSRSDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleUpload = async () => {
    if (!selectedFile || !projectId) return;

    setIsUploading(true);
    try {
      const response = await projectService.uploadSRS(projectId, selectedFile);
      
      toast({
        title: "SRS Uploaded Successfully",
        description: "SRS document has been uploaded and processed successfully.",
      });

      setIsOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call onUploadSuccess callback to refresh project data
      if (onUploadSuccess) {
        // Pass the file name to update state immediately
        onUploadSuccess(selectedFile.name);
      }
    } catch (error: any) {
      console.error('Error uploading SRS:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload SRS document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {hasSRS ? "Update SRS" : "Upload SRS"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload SRS Document</DialogTitle>
          <DialogDescription>
            Upload an SRS (Software Requirements Specification) document in PDF or TXT format
          </DialogDescription>
        </DialogHeader>

        {hasSRS && (
          <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              <strong>SRS Document Uploaded:</strong> {srsFileName || 'SRS document'}
            </span>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="srs-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
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
                disabled={isUploading}
              />
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
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
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

