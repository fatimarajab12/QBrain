// pages/feature-details/AITestCaseGenerationDialog.tsx
// Component for generating test cases using AI from feature description and SRS
import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { testCaseService } from "@/services/test-case.service";
import { useToast } from "@/hooks/use-toast";
import { TestCase } from "@/types/test-case";

interface AITestCaseGenerationDialogProps {
  featureId: string;
  featureName?: string;
  featureType?: "FUNCTIONAL" | "DATA" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
  matchedSections?: string[];
  onApprove: (approvedTestCases: TestCase[]) => void;
  isGenerating: boolean;
}

const AITestCaseGenerationDialog = ({ 
  featureId, 
  featureName,
  featureType,
  matchedSections,
  onApprove, 
  isGenerating: isGeneratingFromParent 
}: AITestCaseGenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set());
  const [isApproving, setIsApproving] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasAIGeneratedTestCases, setHasAIGeneratedTestCases] = useState(false);
  const [isCheckingAITestCases, setIsCheckingAITestCases] = useState(false);
  const { toast } = useToast();
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);
  const generationIdRef = useRef<string | null>(null);

  // Check if feature already has AI-generated test cases on mount
  useEffect(() => {
    const checkAIGeneratedTestCases = async () => {
      if (!featureId) return;
      
      setIsCheckingAITestCases(true);
      try {
        const hasAI = await testCaseService.hasAIGeneratedTestCases(featureId);
        setHasAIGeneratedTestCases(hasAI);
        if (hasAI) {
          setHasGeneratedOnce(true);
        }
      } catch (error) {
        console.error('Error checking AI-generated test cases:', error);
      } finally {
        setIsCheckingAITestCases(false);
      }
    };

    checkAIGeneratedTestCases();
  }, [featureId]);

  // Generate test cases automatically when dialog opens
  useEffect(() => {
    if (isOpen && featureId && !isGeneratingRef.current && !hasGeneratedRef.current) {
      handleGenerate();
    }
  }, [isOpen, featureId]);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      isGeneratingRef.current = false;
      
      if (generatedTestCases.length === 0) {
        hasGeneratedRef.current = false;
        setHasGeneratedOnce(false);
      }
    }
  }, [isOpen, generatedTestCases.length]);

  const handleGenerate = async () => {
    if (isGeneratingRef.current || isGeneratingTestCases) {
      return;
    }

    const currentGenerationId = `${featureId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    generationIdRef.current = currentGenerationId;

    isGeneratingRef.current = true;
    setIsGeneratingTestCases(true);
    try {
      toast({
        title: "Generating Test Cases",
        description: "AI is generating test cases from feature description...",
      });

      // Pass feature information to improve test case generation
      const testCases = await testCaseService.generateAITestCases(featureId, {
        featureType: featureType,
        matchedSections: matchedSections || [],
        useComprehensiveRetrieval: true,
      });
      
      if (generationIdRef.current !== currentGenerationId) {
        return;
      }
      
      if (testCases && testCases.length > 0) {
        const uniqueTestCases = removeDuplicateTestCases(testCases);
        
        setGeneratedTestCases(uniqueTestCases);
        setSelectedTestCases(new Set(uniqueTestCases.map(tc => tc.id)));
        hasGeneratedRef.current = true;
        setHasGeneratedOnce(true);
        
        toast({
          title: "Success!",
          description: `Generated ${uniqueTestCases.length} unique test cases. Please review and approve.`,
        });
      } else {
        toast({
          title: "No Test Cases Generated",
          description: "No test cases were generated. Please check your feature description.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate test cases",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTestCases(false);
      isGeneratingRef.current = false;
    }
  };

  const removeDuplicateTestCases = (testCases: TestCase[]): TestCase[] => {
    const seen = new Map<string, TestCase>();
    
    for (const testCase of testCases) {
      const key = `${testCase.title.toLowerCase().trim()}-${testCase.expectedResult?.toLowerCase().trim().substring(0, 100) || ''}`;
      
      if (!seen.has(key)) {
        seen.set(key, testCase);
      }
    }
    
    return Array.from(seen.values());
  };

  const handleToggleTestCase = (testCaseId: string) => {
    setSelectedTestCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTestCases.size === generatedTestCases.length) {
      setSelectedTestCases(new Set());
    } else {
      setSelectedTestCases(new Set(generatedTestCases.map(tc => tc.id)));
    }
  };

  const handleApprove = async () => {
    if (isApproving) {
      return;
    }

    if (selectedTestCases.size === 0) {
      toast({
        title: "No Test Cases Selected",
        description: "Please select at least one test case to approve.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);
    try {
      const approvedTestCases = generatedTestCases.filter(tc => selectedTestCases.has(tc.id));
      await onApprove(approvedTestCases);
      
      toast({
        title: "Success!",
        description: `Approved ${approvedTestCases.length} test case(s) successfully.`,
      });
      
      setIsOpen(false);
      setGeneratedTestCases([]);
      setSelectedTestCases(new Set());
      hasGeneratedRef.current = false;
      setHasGeneratedOnce(true);
      setHasAIGeneratedTestCases(true);
    } catch (error) {
      console.error('Error approving test cases:', error);
      toast({
        title: "Error",
        description: "Failed to approve test cases",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setGeneratedTestCases([]);
    setSelectedTestCases(new Set());
    hasGeneratedRef.current = false;
    setHasGeneratedOnce(false);
    toast({
      title: "Test Cases Rejected",
      description: "Generated test cases have been rejected.",
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    
    if (!open && hasGeneratedOnce && generatedTestCases.length > 0) {
      // Keep the state - user can reopen to approve/reject
    }
  };

  const isButtonDisabled = hasAIGeneratedTestCases || (hasGeneratedOnce && generatedTestCases.length > 0) || isGeneratingTestCases || isCheckingAITestCases || isGeneratingFromParent;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="gap-2"
          disabled={isButtonDisabled}
          title={hasAIGeneratedTestCases ? "AI test cases have already been generated for this feature" : undefined}
        >
          {isCheckingAITestCases ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Test Cases with AI</DialogTitle>
          <DialogDescription>
            Generate test cases automatically from feature description and SRS document
            {featureName && (
              <span className="block mt-1 text-sm font-medium">Feature: {featureName}</span>
            )}
            {featureType && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Feature Type: {featureType} {matchedSections && matchedSections.length > 0 && `• SRS Sections: ${matchedSections.join(", ")}`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Loading State */}
          {(isGeneratingTestCases || isGeneratingFromParent) && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              <div className="text-center">
                <p className="font-medium">Generating Test Cases with AI...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {/* No Test Cases Generated */}
          {!isGeneratingTestCases && !isGeneratingFromParent && generatedTestCases.length === 0 && hasGeneratedOnce && (
            <Alert className="border-cyan-500/50 bg-cyan-500/10">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              <AlertDescription className="text-sm">
                <strong>No Test Cases Generated</strong>
                <br />
                <span className="text-muted-foreground">No test cases were generated. Please check your feature description.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Generated Test Cases List */}
          {generatedTestCases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Generated Test Cases ({generatedTestCases.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select the test cases you want to approve
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedTestCases.size === generatedTestCases.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {generatedTestCases.map((testCase) => {
                  const isSelected = selectedTestCases.has(testCase.id);
                  return (
                    <Card 
                      key={testCase.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? "border-cyan-500 bg-cyan-50/50" 
                          : "border-border hover:border-cyan-300"
                      }`}
                      onClick={() => handleToggleTestCase(testCase.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleTestCase(testCase.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base">{testCase.title}</CardTitle>
                              {testCase.description && (
                                <CardDescription className="mt-1">
                                  {testCase.description}
                                </CardDescription>
                              )}
                              {testCase.steps && testCase.steps.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Test Steps:</p>
                                  <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-1">
                                    {testCase.steps.slice(0, 3).map((step, idx) => (
                                      <li key={idx}>{step}</li>
                                    ))}
                                    {testCase.steps.length > 3 && (
                                      <li className="text-muted-foreground/70">
                                        +{testCase.steps.length - 3} more steps
                                      </li>
                                    )}
                                  </ol>
                                </div>
                              )}
                              {testCase.expectedResult && (
                                <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
                                  <strong className="text-foreground">Expected Result:</strong> {testCase.expectedResult}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                testCase.priority === "high" ? "destructive" :
                                testCase.priority === "medium" ? "default" : "secondary"
                              }
                            >
                              {testCase.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isApproving}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject All
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || selectedTestCases.size === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Selected ({selectedTestCases.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITestCaseGenerationDialog;

