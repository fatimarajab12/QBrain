// Component for generating features using AI from SRS document
import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, CheckCircle2, XCircle, AlertCircle, Search, X, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { projectService } from "@/services/project.service";
import { featureService } from "@/services/feature.service";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/feature";
import { removeDuplicateFeatures } from "@/utils/array-helpers";
import { logger } from "@/utils/logger";

interface AIGenerationDialogProps {
  projectId: string;
  onApprove: (approvedFeatures: Feature[]) => void;
  isGenerating: boolean;
}

const AIGenerationDialog = ({ projectId, onApprove, isGenerating: isGeneratingFromParent }: AIGenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSRS, setHasSRS] = useState(false);
  const [isCheckingSRS, setIsCheckingSRS] = useState(false);
  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
  const [generatedFeatures, setGeneratedFeatures] = useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [isApproving, setIsApproving] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [hasAIGeneratedFeatures, setHasAIGeneratedFeatures] = useState(false);
  const [isCheckingAIFeatures, setIsCheckingAIFeatures] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [progressStep, setProgressStep] = useState<number>(0);
  const { toast } = useToast();
  const isGeneratingRef = useRef(false);
  const hasGeneratedRef = useRef(false);
  const generationIdRef = useRef<string | null>(null); // Idempotency key

  // Check if project already has AI-generated features on mount
  useEffect(() => {
    const checkAIGeneratedFeatures = async () => {
      if (!projectId) return;
      
      setIsCheckingAIFeatures(true);
      try {
        const hasAI = await featureService.hasAIGeneratedFeatures(projectId);
        setHasAIGeneratedFeatures(hasAI);
        if (hasAI) {
          setHasGeneratedOnce(true);
        }
      } catch (error) {
        console.error('Error checking AI-generated features:', error);
      } finally {
        setIsCheckingAIFeatures(false);
      }
    };

    checkAIGeneratedFeatures();
  }, [projectId]);

  // Check if SRS exists and generate features automatically when dialog opens
  useEffect(() => {
    if (isOpen && projectId && !isGeneratingRef.current && !hasGeneratedRef.current) {
      checkSRSStatusAndGenerate();
    }
  }, [isOpen, projectId]);

  const checkSRSStatusAndGenerate = async () => {
    // Prevent multiple simultaneous calls
    if (isCheckingSRS || isGeneratingRef.current) {
      return;
    }

    setIsCheckingSRS(true);
    setProgressStep(1);
    try {
      const project = await projectService.fetchProjectById(projectId);
      const hasSRSDoc = project.hasSRS || false;
      setHasSRS(hasSRSDoc);
      
      // If SRS exists and we haven't generated yet, generate features automatically
      if (hasSRSDoc && !hasGeneratedRef.current) {
        await handleGenerate();
      } else {
        setProgressStep(0);
      }
    } catch (error) {
      console.error('Error checking SRS status:', error);
      setHasSRS(false);
      setProgressStep(0);
    } finally {
      setIsCheckingSRS(false);
    }
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Only reset generation refs when dialog closes
      // Keep hasGeneratedOnce true if features were generated but not approved/rejected
      isGeneratingRef.current = false;
      
      // If dialog closed and no features are generated, reset everything
      if (generatedFeatures.length === 0) {
        hasGeneratedRef.current = false;
        setHasGeneratedOnce(false);
      }
    }
  }, [isOpen, generatedFeatures.length]);

  const handleGenerate = async () => {
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current || isGeneratingFeatures) {
      logger.debug('Generation already in progress, skipping...');
      return;
    }

    // Generate unique idempotency key for this generation request
    const currentGenerationId = `${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    generationIdRef.current = currentGenerationId;

    isGeneratingRef.current = true;
    setIsGeneratingFeatures(true);
    setProgressStep(2);
    try {
      // Import featureService directly
      const { featureService } = await import("@/services/feature.service");
      
      toast({
        title: "Generating Features",
        description: "AI is analyzing your SRS document and extracting features...",
      });

      setProgressStep(3);
      const features = await featureService.generateAIFeatures(projectId);
      setProgressStep(4);
      
      // Verify this is still the current generation (prevent race conditions)
      if (generationIdRef.current !== currentGenerationId) {
        logger.debug('Generation ID mismatch, ignoring stale response');
        return;
      }
      
      if (features && features.length > 0) {
        // Remove duplicates based on name and description hash
        const uniqueFeatures = removeDuplicateFeatures(features);
        setProgressStep(5);
        
        setGeneratedFeatures(uniqueFeatures);
        // Select all features by default
        setSelectedFeatures(new Set(uniqueFeatures.map(f => f._id)));
        hasGeneratedRef.current = true;
        setHasGeneratedOnce(true); // Mark that generation has happened
        
        setTimeout(() => setProgressStep(0), 500);
        
        toast({
          title: "Success!",
          description: `Generated ${uniqueFeatures.length} unique features. Please review and approve.`,
        });
      } else {
        setProgressStep(0);
        toast({
          title: "No Features Generated",
          description: "No features were generated. Please check your SRS document.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating features:', error);
      setProgressStep(0);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate features from SRS",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeatures(false);
      isGeneratingRef.current = false;
    }
  };


  const handleToggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFeatures.size === generatedFeatures.length) {
      setSelectedFeatures(new Set());
    } else {
      setSelectedFeatures(new Set(generatedFeatures.map(f => f._id)));
    }
  };

  const handleApprove = async () => {
    // Prevent multiple simultaneous calls
    if (isApproving) {
      return;
    }

    if (selectedFeatures.size === 0) {
      toast({
        title: "No Features Selected",
        description: "Please select at least one feature to approve.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);
    try {
      const approvedFeatures = generatedFeatures.filter(f => selectedFeatures.has(f._id));
      await onApprove(approvedFeatures);
      
      toast({
        title: "Success!",
        description: `Approved ${approvedFeatures.length} feature(s) successfully.`,
      });
      
      setIsOpen(false);
      setGeneratedFeatures([]);
      setSelectedFeatures(new Set());
      hasGeneratedRef.current = false;
      setHasGeneratedOnce(true); // Mark as generated after approval
      setHasAIGeneratedFeatures(true); // Mark that AI features exist in project
    } catch (error) {
      console.error('Error approving features:', error);
      toast({
        title: "Error",
        description: "Failed to approve features",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setGeneratedFeatures([]);
    setSelectedFeatures(new Set());
    hasGeneratedRef.current = false;
    setHasGeneratedOnce(false); // Reset after rejection so user can generate again
    toast({
      title: "Features Rejected",
      description: "Generated features have been rejected.",
    });
  };

  const handleOpenChange = (open: boolean) => {
    // If opening dialog and features were already generated, allow opening to approve/reject
    // The button will be disabled inside the dialog
    setIsOpen(open);
    
    // If closing dialog without approving/rejecting, keep hasGeneratedOnce true
    // This prevents re-generation until approve/reject
    if (!open && hasGeneratedOnce && generatedFeatures.length > 0) {
      // Keep the state - user can reopen to approve/reject
      // Don't reset hasGeneratedOnce here
    }
  };

  // Determine if button should be disabled
  // Disable if: 
  // 1. Project already has AI-generated features (from backend check)
  // 2. Features were generated in current session and dialog is open (to prevent re-generation)
  // 3. Currently generating or checking
  const isButtonDisabled = hasAIGeneratedFeatures || (hasGeneratedOnce && generatedFeatures.length > 0) || isGeneratingFeatures || isCheckingSRS || isCheckingAIFeatures;

  // Filter features based on search query
  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) {
      return generatedFeatures;
    }
    const query = searchQuery.toLowerCase();
    return generatedFeatures.filter(feature =>
      feature.name.toLowerCase().includes(query) ||
      feature.description?.toLowerCase().includes(query) ||
      feature.reasoning?.toLowerCase().includes(query) ||
      feature.matchedSections?.some(section => section.toLowerCase().includes(query))
    );
  }, [generatedFeatures, searchQuery]);


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed" 
          data-testid="ai-generate-trigger"
          disabled={isButtonDisabled}
          title={hasAIGeneratedFeatures ? "AI features have already been generated for this project" : undefined}
        >
          {isCheckingAIFeatures ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" variant="gradient" />
              Checking...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Features with AI
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>Generate Features with AI</DialogTitle>
              <DialogDescription>
                Generate features automatically from your SRS document
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={isApproving || isGeneratingFeatures || isCheckingSRS}
              className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* SRS Status Check and Loading */}
          {isCheckingSRS || isGeneratingFeatures || isGeneratingFromParent ? (
            <div className="flex flex-col items-center justify-center gap-6 py-12 animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <LoadingSpinner size="xl" variant="gradient" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 animate-pulse blur-xl" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30 animate-ping" style={{ width: '120%', height: '120%' }} />
              </div>
              <div className="text-center space-y-2 w-full max-w-md">
                <p className="font-semibold text-lg">
                  {isCheckingSRS 
                    ? "Checking SRS Document..." 
                    : isGeneratingFeatures
                    ? "Generating Features with AI..."
                    : "Processing..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCheckingSRS 
                    ? "Verifying your SRS document is ready for feature extraction" 
                    : progressStep === 2
                    ? "Analyzing SRS structure and content..."
                    : progressStep === 3
                    ? "Extracting atomic features from requirements..."
                    : progressStep === 4
                    ? "Validating and deduplicating features..."
                    : progressStep === 5
                    ? "Finalizing results..."
                    : "This may take a few moments"}
                </p>
              </div>
            </div>
          ) : !hasSRS ? (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                <strong className="text-base">SRS Document Required</strong>
                <p className="text-sm mt-1">
                  Please upload an SRS document when creating the project first. The AI needs the SRS document to extract features automatically.
                </p>
              </AlertDescription>
            </Alert>
          ) : generatedFeatures.length === 0 ? (
            <Alert className="border-cyan-500/50 bg-cyan-500/10 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="h-5 w-5 text-cyan-600" />
              <AlertDescription className="text-sm">
                <strong className="text-base">No Features Generated</strong>
                <p className="text-muted-foreground mt-1">
                  No features were generated from your SRS document. Please verify that your document contains clear requirements and try again.
                </p>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Generated Features List */}
          {generatedFeatures.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    Generated Features ({generatedFeatures.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review and select the features you want to approve ({selectedFeatures.size} selected)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="w-full sm:w-auto"
                >
                  {selectedFeatures.size === generatedFeatures.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search features by name, description, or acceptance criteria..."
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

              {filteredFeatures.length === 0 && searchQuery && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm">
                    No features match your search query. Try different keywords.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredFeatures.map((feature, index) => {
                  const isSelected = selectedFeatures.has(feature._id);
                  return (
                    <Card 
                      key={feature._id} 
                      className={`cursor-pointer transition-all duration-200 animate-in fade-in slide-in-from-left-4 ${
                        isSelected 
                          ? "border-cyan-500 bg-cyan-50/50 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-500/20" 
                          : "border-border hover:border-cyan-300 hover:shadow-md hover:bg-accent/50"
                      }`}
                      onClick={() => handleToggleFeature(feature._id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleFeature(feature._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base">{feature.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {feature.description}
                              </CardDescription>
                              {feature.reasoning && (
                                <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs">
                                  <strong className="text-foreground">Reasoning:</strong> {feature.reasoning}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {feature.rankingScore && (
                              <Badge variant="outline" className="text-xs">
                                Score: {feature.rankingScore.toFixed(2)}
                              </Badge>
                            )}
                            {feature.priority && (
                              <Badge 
                                variant={
                                  feature.priority === "High" ? "destructive" :
                                  feature.priority === "Medium" ? "default" : "secondary"
                                }
                              >
                                {feature.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Acceptance Criteria:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                              {feature.acceptanceCriteria.slice(0, 3).map((criteria, idx) => (
                                <li key={idx}>{criteria}</li>
                              ))}
                              {feature.acceptanceCriteria.length > 3 && (
                                <li className="text-muted-foreground/70">
                                  +{feature.acceptanceCriteria.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isApproving || filteredFeatures.length === 0}
                  className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject All
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || selectedFeatures.size === 0}
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
                      Approve Selected ({selectedFeatures.size}/{filteredFeatures.length})
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

export default AIGenerationDialog;
