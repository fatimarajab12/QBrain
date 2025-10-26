// pages/project-details/AIGenerationDialog.tsx
import { useState } from "react";
import { Sparkles, Upload, Loader2, FileText, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AIGenerationDialogProps {
  onGenerate: (file: File, extractedText?: string) => void;
  isGenerating: boolean;
}

const AIGenerationDialog = ({ onGenerate, isGenerating }: AIGenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      await extractTextFromFile(file);
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

  const handleGenerate = async () => {
    if (selectedFile) {
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
        <Button className="gradient-ai" data-testid="ai-generate-trigger">
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
          {/* File Upload Section */}
          <Card className="border-dashed border-2">
            <CardContent className="pt-6">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-2">Upload Requirements Document</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports: PDF, Word (.docx), Text (.txt)
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
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
            className="w-full gradient-ai"
            disabled={(!selectedFile && !extractedText.trim()) || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generating Features..." : "Generate Features"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationDialog;