import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, CheckCircle2, XCircle, AlertCircle, Search, X, TestTube } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { testCaseService } from "@/services/test-case.service";
import { useToast } from "@/hooks/use-toast";
import { TestCase } from "@/types/test-case";
import { removeDuplicateTestCases } from "@/utils/array-helpers";
import { logger } from "@/utils/logger";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [progressStep, setProgressStep] = useState<number>(0);
  const { toast } = useToast();
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);
  const generationIdRef = useRef<string | null>(null);

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
        logger.error('Error checking AI-generated test cases', error);
      } finally {
        setIsCheckingAITestCases(false);
      }
    };

    checkAIGeneratedTestCases();
  }, [featureId]);

  useEffect(() => {
    if (isOpen && featureId && !isGeneratingRef.current && !hasGeneratedRef.current && !hasAIGeneratedTestCases && !hasGeneratedOnce && !isApproving) {
      handleGenerate();
    }
  }, [isOpen, featureId, hasAIGeneratedTestCases, hasGeneratedOnce, isApproving]);

  useEffect(() => {
    if (!isOpen) {
      isGeneratingRef.current = false;
      
      if (generatedTestCases.length === 0 && !hasAIGeneratedTestCases) {
        hasGeneratedRef.current = false;
        setHasGeneratedOnce(false);
      }
    }
  }, [isOpen, generatedTestCases.length, hasAIGeneratedTestCases]);

  const handleGenerate = async () => {
    if (isGeneratingRef.current || isGeneratingTestCases) {
      return;
    }

    const currentGenerationId = `${featureId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    generationIdRef.current = currentGenerationId;

    isGeneratingRef.current = true;
    setIsGeneratingTestCases(true);
    setProgressStep(1);
    try {
      toast({
        title: "Generating Test Cases",
        description: "AI is analyzing the feature and SRS document...",
      });

      setProgressStep(2);
      const testCases = await testCaseService.generateAITestCases(featureId, {
        featureType: featureType,
        matchedSections: matchedSections || [],
        useComprehensiveRetrieval: true,
      });
      setProgressStep(3);
      
      if (generationIdRef.current !== currentGenerationId) {
        return;
      }
      
      if (testCases && testCases.length > 0) {
        const uniqueTestCases = removeDuplicateTestCases(testCases);
        setProgressStep(4);
        
        setGeneratedTestCases(uniqueTestCases);
        setSelectedTestCases(new Set(uniqueTestCases.map(tc => tc._id)));
        hasGeneratedRef.current = true;
        setHasGeneratedOnce(true);
        
        setTimeout(() => setProgressStep(0), 500);
        
        toast({
          title: "Success!",
          description: `Generated ${uniqueTestCases.length} unique test cases. Please review and approve.`,
        });
      } else {
        setProgressStep(0);
        toast({
          title: "No Test Cases Generated",
          description: "No test cases were generated. Please check your feature description.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Error generating test cases', error);
      setProgressStep(0);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate test cases",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTestCases(false);
      isGeneratingRef.current = false;
    }
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
      setSelectedTestCases(new Set(generatedTestCases.map(tc => tc._id)));
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
      const approvedTestCases = generatedTestCases.filter(tc => selectedTestCases.has(tc._id));
      
      setIsOpen(false);
      setGeneratedTestCases([]);
      setSelectedTestCases(new Set());
      hasGeneratedRef.current = true;
      setHasGeneratedOnce(true);
      setHasAIGeneratedTestCases(true);
      
      await onApprove(approvedTestCases);
      
      toast({
        title: "Success!",
        description: `Approved ${approvedTestCases.length} test case(s) successfully.`,
      });
    } catch (error) {
      logger.error('Error approving test cases', error);
      hasGeneratedRef.current = false;
      setHasGeneratedOnce(false);
      setHasAIGeneratedTestCases(false);
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
    if (!open) {
      setIsOpen(false);
      if (!hasAIGeneratedTestCases && generatedTestCases.length === 0) {
        hasGeneratedRef.current = false;
        setHasGeneratedOnce(false);
      }
    } else {
      if (hasAIGeneratedTestCases || isApproving) {
        return;
      }
      setIsOpen(true);
    }
  };

  const isButtonDisabled = hasAIGeneratedTestCases || (hasGeneratedOnce && generatedTestCases.length > 0) || isGeneratingTestCases || isCheckingAITestCases || isGeneratingFromParent;

  // Filter test cases based on search query
  const filteredTestCases = useMemo(() => {
    if (!searchQuery.trim()) {
      return generatedTestCases;
    }
    const query = searchQuery.toLowerCase();
    return generatedTestCases.filter(testCase =>
      testCase.title.toLowerCase().includes(query) ||
      testCase.description?.toLowerCase().includes(query) ||
      testCase.expectedResult?.toLowerCase().includes(query) ||
      testCase.steps?.some(step => step.toLowerCase().includes(query)) ||
      testCase.priority?.toLowerCase().includes(query)
    );
  }, [generatedTestCases, searchQuery]);


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
              <LoadingSpinner size="sm" variant="gradient" />
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-cyan-600" />
                Generate Test Cases with AI
              </DialogTitle>
              <DialogDescription className="space-y-1">
                <p>Generate comprehensive test cases automatically from feature description and SRS document</p>
                {featureName && (
                  <span className="block mt-1 text-sm font-medium text-foreground">Feature: {featureName}</span>
                )}
                {featureType && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Feature Type: <Badge variant="outline" className="ml-1">{featureType}</Badge>
                  </span>
                )}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isApproving || isGeneratingTestCases}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {(isGeneratingTestCases || isGeneratingFromParent) && (
            <div className="flex flex-col items-center justify-center gap-6 py-12 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <LoadingSpinner size="xl" variant="gradient" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse blur-xl" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-ping" style={{ width: '120%', height: '120%' }} />
              </div>
              <div className="text-center space-y-2 w-full max-w-md">
                <p className="font-semibold text-lg">Generating Test Cases with AI...</p>
                <p className="text-sm text-muted-foreground">
                  {progressStep === 1
                    ? "Analyzing feature description and requirements..."
                    : progressStep === 2
                    ? "Generating comprehensive test scenarios (positive, negative, boundary cases)..."
                    : progressStep === 3
                    ? "Validating and deduplicating test cases..."
                    : progressStep === 4
                    ? "Finalizing results..."
                    : "This may take a few moments"}
                </p>
              </div>
            </div>
          )}

          {!isGeneratingTestCases && !isGeneratingFromParent && generatedTestCases.length === 0 && hasGeneratedOnce && (
            <Alert className="border-cyan-500/50 bg-cyan-500/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="h-5 w-5 text-cyan-600" />
              <AlertDescription className="text-sm">
                <strong className="text-base">No Test Cases Generated</strong>
                <p className="text-muted-foreground mt-1">
                  No test cases were generated. Please verify that your feature description contains sufficient detail and try again.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {generatedTestCases.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-cyan-600" />
                    Generated Test Cases ({generatedTestCases.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review and select the test cases you want to approve ({selectedTestCases.size} selected)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="w-full sm:w-auto"
                >
                  {selectedTestCases.size === generatedTestCases.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search test cases by title, description, steps, or priority..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {filteredTestCases.length === 0 && searchQuery && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm">
                    No test cases match your search query. Try different keywords.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTestCases.map((testCase, index) => {
                  const isSelected = selectedTestCases.has(testCase._id);
                  return (
                    <Card 
                      key={testCase._id} 
                      className={`cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                        isSelected 
                          ? "border-cyan-500 bg-cyan-50/50 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-500/20" 
                          : "border-border hover:border-cyan-300 hover:shadow-md hover:bg-accent/50"
                      }`}
                      onClick={() => handleToggleTestCase(testCase._id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleTestCase(testCase._id)}
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isApproving || filteredTestCases.length === 0}
                  className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject All
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || selectedTestCases.size === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" variant="gradient" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Selected ({selectedTestCases.size}/{filteredTestCases.length})
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

