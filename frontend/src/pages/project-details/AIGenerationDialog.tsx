// pages/project-details/AIGenerationDialog.tsx
// Component for generating features using AI from SRS document
import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { projectService } from "@/services/project.service";
import { featureService } from "@/services/feature.service";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/feature";

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
    try {
      const project = await projectService.fetchProjectById(projectId);
      const hasSRSDoc = project.hasSRS || false;
      setHasSRS(hasSRSDoc);
      
      // If SRS exists and we haven't generated yet, generate features automatically
      if (hasSRSDoc && !hasGeneratedRef.current) {
        await handleGenerate();
      }
    } catch (error) {
      console.error('Error checking SRS status:', error);
      setHasSRS(false);
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
      console.log('Generation already in progress, skipping...');
      return;
    }

    // Generate unique idempotency key for this generation request
    const currentGenerationId = `${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    generationIdRef.current = currentGenerationId;

    isGeneratingRef.current = true;
    setIsGeneratingFeatures(true);
    try {
      // Import featureService directly
      const { featureService } = await import("@/services/feature.service");
      
      toast({
        title: "Generating Features",
        description: "AI is generating features from SRS document...",
      });

      const features = await featureService.generateAIFeatures(projectId);
      
      // Verify this is still the current generation (prevent race conditions)
      if (generationIdRef.current !== currentGenerationId) {
        console.log('Generation ID mismatch, ignoring stale response');
        return;
      }
      
      if (features && features.length > 0) {
        // Remove duplicates based on name and description hash
        const uniqueFeatures = removeDuplicateFeatures(features);
        
        setGeneratedFeatures(uniqueFeatures);
        // Select all features by default
        setSelectedFeatures(new Set(uniqueFeatures.map(f => f.id)));
        hasGeneratedRef.current = true;
        setHasGeneratedOnce(true); // Mark that generation has happened
        
        toast({
          title: "Success!",
          description: `Generated ${uniqueFeatures.length} unique features. Please review and approve.`,
        });
      } else {
        toast({
          title: "No Features Generated",
          description: "No features were generated. Please check your SRS document.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating features:', error);
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

  // Helper function to remove duplicate features based on name and description
  const removeDuplicateFeatures = (features: Feature[]): Feature[] => {
    const seen = new Map<string, Feature>();
    
    for (const feature of features) {
      // Create a unique key based on name and description
      const key = `${feature.name.toLowerCase().trim()}-${feature.description?.toLowerCase().trim().substring(0, 100) || ''}`;
      
      if (!seen.has(key)) {
        seen.set(key, feature);
      }
    }
    
    return Array.from(seen.values());
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
      setSelectedFeatures(new Set(generatedFeatures.map(f => f.id)));
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
      const approvedFeatures = generatedFeatures.filter(f => selectedFeatures.has(f.id));
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Features with AI</DialogTitle>
          <DialogDescription>
            Generate features automatically from your SRS document
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* SRS Status Check and Loading */}
          {isCheckingSRS || isGeneratingFeatures || isGeneratingFromParent ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              <div className="text-center">
                <p className="font-medium">
                  {isCheckingSRS ? "Checking SRS status..." : "Generating Features with AI..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isCheckingSRS 
                    ? "Please wait while we verify your SRS document" 
                    : "This may take a few moments"}
                </p>
              </div>
            </div>
          ) : !hasSRS ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>SRS Document Required</strong>
                <br />
                <span className="text-sm">Please upload an SRS document when creating the project first.</span>
              </AlertDescription>
            </Alert>
          ) : generatedFeatures.length === 0 ? (
            <Alert className="border-cyan-500/50 bg-cyan-500/10">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              <AlertDescription className="text-sm">
                <strong>No Features Generated</strong>
                <br />
                <span className="text-muted-foreground">No features were generated. Please check your SRS document.</span>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Generated Features List */}
          {generatedFeatures.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Generated Features ({generatedFeatures.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select the features you want to approve
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedFeatures.size === generatedFeatures.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {generatedFeatures.map((feature) => {
                  const isSelected = selectedFeatures.has(feature.id);
                  return (
                    <Card 
                      key={feature.id} 
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? "border-cyan-500 bg-cyan-50/50" 
                          : "border-border hover:border-cyan-300"
                      }`}
                      onClick={() => handleToggleFeature(feature.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleFeature(feature.id)}
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
                              {feature.matchedSections && feature.matchedSections.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Matched SRS Sections: {feature.matchedSections.join(", ")}
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
                  disabled={isApproving || selectedFeatures.size === 0}
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
                      Approve Selected ({selectedFeatures.size})
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
