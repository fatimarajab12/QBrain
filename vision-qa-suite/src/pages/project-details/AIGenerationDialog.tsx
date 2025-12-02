// pages/project-details/AIGenerationDialog.tsx
import { useState, useEffect } from "react";
import { Sparkles, Upload, Loader2, FileText, Edit, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { projectService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

interface AIGenerationDialogProps {
  projectId: string;
  onGenerate: (file: File, extractedText?: string) => void;
  isGenerating: boolean;
}

const AIGenerationDialog = ({ projectId, onGenerate, isGenerating }: AIGenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasSRS, setHasSRS] = useState(false);
  const [srsFileName, setSrsFileName] = useState<string | undefined>();
  const [isCheckingSRS, setIsCheckingSRS] = useState(false);
  const [isUploadingSRS, setIsUploadingSRS] = useState(false);
  const { toast } = useToast();

  // Check if SRS already exists when dialog opens
  useEffect(() => {
    if (isOpen && projectId) {
      checkSRSStatus();
    }
  }, [isOpen, projectId]);

  const checkSRSStatus = async () => {
    setIsCheckingSRS(true);
    try {
      const project = await projectService.fetchProjectById(projectId);
      setHasSRS(project.hasSRS || false);
      setSrsFileName(project.srsFileName);
    } catch (error) {
      console.error('Error checking SRS status:', error);
    } finally {
      setIsCheckingSRS(false);
    }
  };


  const extractTextFromFile = async (file: File): Promise<void> => {
    setIsExtracting(true);
    try {
      let text = "";
      
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // For text files
        text = await file.text();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // For PDF files - this would need a PDF parsing library in real implementation
        text = "PDF content extraction would happen here. In a real app, you'd use a PDF parsing library.";
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        // For Word documents - this would need a DOCX parsing library
        text = "Word document content extraction would happen here. In a real app, you'd use a DOCX parsing library.";
      } else {
        text = "Unsupported file type for text extraction";
      }
      
      setExtractedText(text);
    } catch (error) {
      console.error('Error extracting text from file:', error);
      setExtractedText("Error extracting text from file. Please try another file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if SRS already exists
      if (hasSRS) {
        toast({
          title: "SRS Already Uploaded",
          description: "This project already has an SRS document. Each project can only have one SRS document.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      await extractTextFromFile(file);
    }
  };

  const handleUploadSRS = async () => {
    if (!selectedFile || !projectId) return;

    setIsUploadingSRS(true);
    try {
      await projectService.uploadSRS(projectId, selectedFile);
      setHasSRS(true);
      setSrsFileName(selectedFile.name);
      
      toast({
        title: "SRS Uploaded Successfully",
        description: "SRS document has been uploaded and processed.",
      });

      // After SRS is uploaded, proceed with generation
      await onGenerate(selectedFile, extractedText);
      setIsOpen(false);
      setSelectedFile(null);
      setExtractedText("");
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error uploading SRS:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload SRS document",
        variant: "destructive",
      });
    } finally {
      setIsUploadingSRS(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      // If no file but has text, just generate from text
      if (extractedText.trim()) {
        await onGenerate(new File([], 'manual-input.txt'), extractedText);
        setIsOpen(false);
        setExtractedText("");
        setIsEditing(false);
      }
      return;
    }

    // If SRS not uploaded yet, upload it first
    if (!hasSRS) {
      await handleUploadSRS();
    } else {
      // SRS already exists, just generate from current file/text
      await onGenerate(selectedFile, extractedText);
      setIsOpen(false);
      setSelectedFile(null);
      setExtractedText("");
      setIsEditing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedFile(null);
      setExtractedText("");
      setIsEditing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25" data-testid="ai-generate-trigger">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Features with AI</DialogTitle>
          <DialogDescription>
            Upload a document or paste requirements text to generate features and test cases
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* SRS Status Alert */}
          {isCheckingSRS ? (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking SRS status...</span>
            </div>
          ) : hasSRS ? (
            <Alert className="border-cyan-500/50 bg-cyan-500/10">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              <AlertDescription className="text-sm">
                <strong>SRS Document Already Uploaded:</strong> {srsFileName || 'SRS document'}
                <br />
                <span className="text-muted-foreground">Each project can only have one SRS document. You can still generate features from manual text input below.</span>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* File Upload Section */}
          <Card className={`border-dashed border-2 ${hasSRS ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-2">Upload Requirements Document</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports: PDF, Word (.docx), Text (.txt)
                </p>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={hasSRS}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* File Info */}
          {selectedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}

          {/* Extracted Text Section */}
          {(extractedText || isExtracting) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="extracted-text">Requirements Text</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={isExtracting}
                >
                  {isEditing ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Edit className="mr-1 h-3 w-3" />
                  )}
                  {isEditing ? "Done Editing" : "Edit Text"}
                </Button>
              </div>
              
              {isExtracting ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Extracting text from document...</span>
                </div>
              ) : (
                <Textarea
                  id="extracted-text"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  readOnly={!isEditing}
                  className={`min-h-[200px] font-mono text-sm ${
                    isEditing 
                      ? "border-blue-300 bg-blue-50" 
                      : "bg-muted/50"
                  }`}
                  placeholder="Text will be extracted from your document here..."
                />
              )}
              
              {!isEditing && extractedText && (
                <p className="text-xs text-muted-foreground">
                  Click "Edit Text" to modify the extracted content before generating features
                </p>
              )}
            </div>
          )}

          {/* Manual Text Input Fallback */}
          {!selectedFile && (
            <div className="space-y-3">
              <Label htmlFor="manual-text">Or Paste Requirements Manually</Label>
              <Textarea
                id="manual-text"
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Paste your requirements here, or upload a document above..."
                className="min-h-[150px]"
              />
            </div>
          )}

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
            disabled={(!selectedFile && !extractedText.trim()) || isGenerating || isUploadingSRS}
          >
            {isGenerating || isUploadingSRS ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isUploadingSRS 
              ? "Uploading SRS..." 
              : isGenerating 
              ? "Generating Features..." 
              : hasSRS && !selectedFile
              ? "Generate from Text"
              : "Upload SRS & Generate Features"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationDialog;