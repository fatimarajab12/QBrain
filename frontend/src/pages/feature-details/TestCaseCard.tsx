// pages/feature-details/components/TestCaseCard.tsx
import { useState } from "react";
import { Play, AlertCircle, CheckCircle2, Edit, Trash2, FileCode, Copy, Check, X, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCase } from "@/types/test-case";
import { getPriorityColor, getStatusColor } from "@/utils/test-case-helpers";
import { testCaseService } from "@/services/test-case.service";
import { useToast } from "@/hooks/use-toast";

interface TestCaseCardProps {
  testCase: TestCase;
  onEdit: (testCase: TestCase) => void;
  onDelete: (testCaseId: string) => void;
  onStatusUpdate: (testCaseId: string, status: "passed" | "failed") => void;
  onPriorityUpdate?: (testCaseId: string, priority: "high" | "medium" | "low") => void;
  isDeleting?: boolean;
}

const TestCaseCard = ({ testCase, onEdit, onDelete, onStatusUpdate, onPriorityUpdate, isDeleting = false }: TestCaseCardProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const [showGherkinDialog, setShowGherkinDialog] = useState(false);
  const [gherkinCode, setGherkinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoadingGherkin, setIsLoadingGherkin] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <Play className="h-4 w-4" />;
      default: return null;
    }
  };

  // Convert Test Case to Gherkin format (improved version)
  const convertToGherkin = (testCase: TestCase): string => {
    // Clean feature name (remove special characters, keep spaces)
    const featureName = (testCase.title || 'Test Feature')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim() || 'Test Feature';
    
    let gherkin = `Feature: ${featureName}\n`;
    
    // Add description if available
    if (testCase.description) {
      gherkin += `  ${testCase.description}\n`;
    }
    
    // Add scenario
    const scenarioName = testCase.title || 'Test Scenario';
    gherkin += `\n  Scenario: ${scenarioName}\n`;
    
    // Add preconditions as Given steps
    if (testCase.preconditions && Array.isArray(testCase.preconditions) && testCase.preconditions.length > 0) {
      testCase.preconditions.forEach((precondition, index) => {
        const keyword = index === 0 ? 'Given' : 'And';
        const formattedPrecondition = String(precondition).trim();
        // Remove existing keywords if present
        const cleanedPrecondition = formattedPrecondition.replace(/^(Given|When|Then|And)\s+/i, '');
        gherkin += `    ${keyword} ${cleanedPrecondition}\n`;
      });
    }
    
    // Add steps as When/And steps
    if (testCase.steps && Array.isArray(testCase.steps) && testCase.steps.length > 0) {
      const hasPreconditions = testCase.preconditions && testCase.preconditions.length > 0;
      testCase.steps.forEach((step, index) => {
        const keyword = !hasPreconditions && index === 0 ? 'When' : 'And';
        const formattedStep = String(step).trim();
        // Remove existing keywords if present
        const cleanedStep = formattedStep.replace(/^(Given|When|Then|And)\s+/i, '');
        gherkin += `    ${keyword} ${cleanedStep}\n`;
      });
    }
    
    // Add expected result as Then step
    if (testCase.expectedResult) {
      const formattedResult = String(testCase.expectedResult).trim();
      // Remove existing keywords if present
      const cleanedResult = formattedResult.replace(/^(Given|When|Then|And)\s+/i, '');
      gherkin += `    Then ${cleanedResult}\n`;
    }
    
    return gherkin;
  };

  // Handle opening Gherkin dialog
  const handleOpenGherkinDialog = async () => {
    setIsLoadingGherkin(true);
    try {
      // Use saved Gherkin if available, otherwise fetch/generate
      if (testCase.gherkin) {
        setGherkinCode(testCase.gherkin);
        setShowGherkinDialog(true);
        setIsLoadingGherkin(false);
        return;
      }

      // Try to fetch from API
      try {
        const result = await testCaseService.convertToGherkin(testCase.id);
        setGherkinCode(result.gherkin);
      } catch (apiError) {
        // Fallback to local conversion if API fails
        console.warn('API conversion failed, using local conversion:', apiError);
        const gherkin = convertToGherkin(testCase);
        setGherkinCode(gherkin);
      }
      setShowGherkinDialog(true);
    } catch (error: any) {
      console.error('Error converting to Gherkin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert to Gherkin",
        variant: "destructive",
      });
      // Still show dialog with local conversion
      const gherkin = convertToGherkin(testCase);
      setGherkinCode(gherkin);
      setShowGherkinDialog(true);
    } finally {
      setIsLoadingGherkin(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gherkinCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Gherkin code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Handle download as .feature file
  const handleDownload = () => {
    try {
      const fileName = (testCase.title || 'test-case')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase() + '.feature';
      
      const blob = new Blob([gherkinCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Downloaded!",
        description: `File saved as ${fileName}`,
      });
    } catch (error) {
      console.error('Failed to download:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-soft border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-lg flex-1 pr-2">{testCase.title}</CardTitle>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenGherkinDialog}
                  className="h-8 w-8 p-0 hover:bg-muted"
                  title="Convert to Gherkin"
                  disabled={isLoadingGherkin}
                >
                  {isLoadingGherkin ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileCode className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(testCase)}
                  className="h-8 w-8 p-0 hover:bg-muted"
                  title="Edit test case"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isDeleting}
                      title="Delete test case"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Test Case</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{testCase.title}"? This action cannot be undone and will permanently delete all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(testCase.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {onPriorityUpdate ? (
                <Select
                  value={testCase.priority}
                  onValueChange={(value: "high" | "medium" | "low") => onPriorityUpdate(testCase.id, value)}
                >
                  <SelectTrigger className={`h-10 w-[120px] ${getPriorityColor(testCase.priority)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPriorityColor(testCase.priority)}>
                  {testCase.priority}
                </Badge>
              )}
              <Badge className={getStatusColor(testCase.status)}>
                <span className="mr-1">{getStatusIcon(testCase.status)}</span>
                {testCase.status}
              </Badge>
              {testCase.bugReports.length > 0 && (
                <Badge variant="destructive">
                  {testCase.bugReports.length} Bug{testCase.bugReports.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Preconditions</h4>
              {testCase.preconditions && testCase.preconditions.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {testCase.preconditions.map((precondition, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{precondition}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No preconditions specified</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Steps</h4>
              <ol className="list-decimal list-inside space-y-1">
                {testCase.steps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Expected Result</h4>
              <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            {testCase.actualResult && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Actual Result</h4>
                <p className="text-sm text-muted-foreground">{testCase.actualResult}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onStatusUpdate(testCase.id, "passed")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark Passed
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onStatusUpdate(testCase.id, "failed")}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark Failed
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Gherkin Dialog */}
      <Dialog open={showGherkinDialog} onOpenChange={setShowGherkinDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                Gherkin Format
              </DialogTitle>
              {testCase.gherkin && (
                <Badge variant="secondary" className="text-xs">
                  Auto-generated
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {testCase.title}
            </p>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 min-h-0 py-4">
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCode className="h-4 w-4" />
                <span>Edit the Gherkin code below or use the actions to copy/download</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2 shadow-sm hover:shadow"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2 shadow-sm hover:shadow bg-primary"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .feature</span>
                </Button>
              </div>
            </div>
            
            {/* Gherkin Code Editor */}
            <div className="flex-1 min-h-0 relative border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
              <Textarea
                value={gherkinCode}
                onChange={(e) => setGherkinCode(e.target.value)}
                className="font-mono text-sm h-full min-h-[450px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-4"
                placeholder="Gherkin code will appear here..."
                spellCheck={false}
              />
              {isLoadingGherkin && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Gherkin...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowGherkinDialog(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TestCaseCard;