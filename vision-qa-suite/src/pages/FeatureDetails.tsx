// pages/FeatureDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Search, X, Filter, Sparkles, CheckCircle2, Brain, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTestCases } from "../hooks/useTestCases";
import TestCaseCard from "./feature-details/TestCaseCard";
import CreateTestCaseDialog from "./feature-details/CreateTestCaseDialog";
import EditTestCaseDialog from "./feature-details/EditTestCaseDialog";
import AITestCaseGenerationDialog from "./feature-details/AITestCaseGenerationDialog";
import StatsGrid from "./feature-details/StatsGrid";
import BugsTab from "./feature-details/BugsTab";
import { Bug } from "@/types/bug";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { TestCase } from "@/types/test-case";
import { Feature } from "@/types/feature";
import { featureService } from "@/services/feature.service";

// Bugs will be fetched from API

const FeatureDetails = () => {
  const { projectId, featureId } = useParams();
  const { toast } = useToast();

  // Feature state
  const [feature, setFeature] = useState<Feature | null>(null);
  const [isLoadingFeature, setIsLoadingFeature] = useState(true);

  // Use featureId as string (MongoDB ObjectId) instead of converting to number
  const {
    testCases,
    isLoading,
    isCreating,
    isUpdating,
    editingTestCase,
    setEditingTestCase,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    updateTestCaseStatus,
    updateTestCasePriority,
    generateTestCases,
    bulkCreateTestCases,
    hasAIGeneratedTestCases,
    isCheckingAITestCases,
  } = useTestCases(featureId);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"test-cases" | "bugs">("test-cases");
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoadingBugs, setIsLoadingBugs] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Handle priority update
  const handlePriorityChange = async (newPriority: "High" | "Medium" | "Low") => {
    if (!feature || !featureId) return;
    
    setIsUpdatingPriority(true);
    try {
      const updatedFeature = await featureService.updateFeature(featureId, {
        name: feature.name,
        description: feature.description,
        priority: newPriority,
      });
      setFeature(updatedFeature);
      toast({
        title: "Success",
        description: `Priority updated to ${newPriority}`,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Fetch feature details
  useEffect(() => {
    const fetchFeature = async () => {
      if (!featureId) return;
      
      setIsLoadingFeature(true);
      try {
        const featureData = await featureService.getFeature(featureId);
        setFeature(featureData);
      } catch (error) {
        console.error("Error fetching feature:", error);
        toast({
          title: "Error",
          description: "Failed to load feature details",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFeature(false);
      }
    };

    fetchFeature();
  }, [featureId, toast]);

  // Fetch bugs from API
  useEffect(() => {
    const fetchBugs = async () => {
      if (!featureId) return;
      
      setIsLoadingBugs(true);
      try {
        // TODO: Replace with actual bugs API endpoint when available
        // For now, bugs are empty array
        setBugs([]);
      } catch (error) {
        console.error("Error fetching bugs:", error);
      } finally {
        setIsLoadingBugs(false);
      }
    };
    
    if (activeTab === "bugs" && featureId) {
      fetchBugs();
    }
  }, [featureId, activeTab]);

  // Filter bugs for this specific feature
const featureBugs = bugs.filter(bug => 
  featureId && bug.feature_id.toString() === featureId
);


const handleAddBug = async (bugData: Omit<Bug, 'id' | 'created_at' | 'updated_at'>) => {
  if (!featureId || !projectId) return;
  
  try {
    // TODO: Replace with actual bugs API endpoint when available
    toast({
      title: "Bug Creation",
      description: "Bug creation API endpoint not yet implemented",
    });
  } catch (error) {
    console.error("Error adding bug:", error);
    toast({
      title: "Error",
      description: "Failed to add bug",
      variant: "destructive",
    });
  }
};

const handleUpdateBugStatus = async (bugId: number, status: Bug['status']) => {
  try {
    // Update via API
    await bugService.updateBugStatus(bugId, status);
    
    // Update local state
    setBugs(prev => prev.map(bug => 
      bug.id === bugId 
        ? { ...bug, status, updated_at: new Date().toISOString() }
        : bug
    ));

    toast({
      title: "Success",
      description: `Bug status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating bug status:', error);
    // Fallback: update local state anyway
    setBugs(prev => prev.map(bug => 
      bug.id === bugId 
        ? { ...bug, status, updated_at: new Date().toISOString() }
        : bug
    ));
    
    toast({
      title: "Status Updated",
      description: `Bug status updated to ${status} (local update)`,
    });
  }
};

const handleDeleteTestCase = async (testCaseId: number) => {
  setIsDeleting(true);
  try {
    await deleteTestCase(testCaseId);
  } finally {
    setIsDeleting(false);
  }
};

// Filter test cases
const filteredTestCases = useMemo(() => {
  let filtered = [...testCases];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(tc => 
      tc.title.toLowerCase().includes(query) ||
      tc.description?.toLowerCase().includes(query) ||
      tc.expectedResult.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter(tc => tc.status === statusFilter);
  }

  // Priority filter
  if (priorityFilter !== "all") {
    filtered = filtered.filter(tc => tc.priority === priorityFilter);
  }

  return filtered;
}, [testCases, searchQuery, statusFilter, priorityFilter]);

const hasActiveFilters = searchQuery.trim() || statusFilter !== "all" || priorityFilter !== "all";

const clearFilters = () => {
  setSearchQuery("");
  setStatusFilter("all");
  setPriorityFilter("all");
};
  if (isLoading || isLoadingFeature) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <Link to={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Features
          </Button>
        </Link>
      </div>

      {/* Feature Details Card */}
      {feature && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{feature.name}</CardTitle>
                  {feature.isAIGenerated && (
                    <Badge variant="secondary" className="gap-1">
                      <Brain className="h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base mt-2">
                  {feature.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <Select
                    value={feature.priority || "Medium"}
                    onValueChange={(value: "High" | "Medium" | "Low") => handlePriorityChange(value)}
                    disabled={isUpdatingPriority}
                  >
                    <SelectTrigger 
                      className={`h-10 w-[120px] ${
                        feature.priority === "High" 
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                          : feature.priority === "Medium"
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
                          : "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {isUpdatingPriority ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High" className="text-red-700 dark:text-red-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="Medium" className="text-yellow-700 dark:text-yellow-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="Low" className="text-green-700 dark:text-green-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Low
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold">{feature.testCasesCount || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Test Cases</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold text-destructive">{feature.bugsCount || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Bugs</div>
              </div>
            </div>

            <Separator />

            {/* Acceptance Criteria */}
            {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Acceptance Criteria</h3>
                </div>
                <ul className="space-y-2 ml-7">
                  {feature.acceptanceCriteria.map((criteria, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1.5">•</span>
                      <span className="flex-1">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Reasoning */}
            {feature.reasoning && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Reasoning</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7 leading-relaxed">
                    {feature.reasoning}
                  </p>
                </div>
              </>
            )}

            {/* Matched SRS Sections */}
            {feature.matchedSections && feature.matchedSections.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Matched SRS Sections</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-7">
                    {feature.matchedSections.map((section, idx) => (
                      <Badge key={idx} variant="secondary">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* AI Confidence */}
            {feature.confidence !== undefined && feature.confidence !== null && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Confidence</h3>
                  </div>
                  <div className="ml-7 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Score</span>
                      <span className="font-medium">{Math.round(feature.confidence * 100)}%</span>
                    </div>
                    <Progress value={feature.confidence * 100} className="h-3" />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Cases & Bugs Management</h2>
          <p className="text-muted-foreground">Execute and track test cases for this feature</p>
        </div>
          
        <div className="flex gap-2">
          <AITestCaseGenerationDialog
            featureId={featureId || ""}
            featureName={feature?.name}
            onApprove={async (approvedTestCases) => {
              // Convert TestCase[] to Omit<TestCase, 'id'>[] for bulk create
              const testCasesToCreate = approvedTestCases.map(tc => ({
                title: tc.title,
                priority: tc.priority,
                status: tc.status,
                preconditions: tc.preconditions,
                steps: tc.steps,
                expectedResult: tc.expectedResult,
                actualResult: tc.actualResult,
                bugReports: tc.bugReports,
                featureId: tc.featureId,
                projectId: tc.projectId,
              }));
              await bulkCreateTestCases(testCasesToCreate);
            }}
            isGenerating={isCreating || isCheckingAITestCases}
          />
          <CreateTestCaseDialog
            isCreating={isCreating}
            onCreate={createTestCase}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("test-cases")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "test-cases"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Test Cases ({testCases.length})
            </button>
            <button
              onClick={() => setActiveTab("bugs")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bugs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Bugs ({featureBugs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "test-cases" ? (
        <>
          {/* Statistics */}
          {testCases.length > 0 && <StatsGrid testCases={testCases} />}

          {/* Test Cases List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Test Cases ({filteredTestCases.length}{hasActiveFilters ? ` of ${testCases.length}` : ''})
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-10 w-full sm:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
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

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {testCases.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No test cases found. Create your first test case to get started.
                </div>
                <div className="flex gap-2 justify-center">
                  <CreateTestCaseDialog
                    isCreating={isCreating}
                    onCreate={createTestCase}
                  />
                </div>
              </div>
            ) : filteredTestCases.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="text-muted-foreground mb-4">
                  No test cases match your filters.
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTestCases.map((testCase) => (
                  <TestCaseCard
                    key={testCase.id}
                    testCase={testCase}
                    onEdit={setEditingTestCase}
                    onDelete={handleDeleteTestCase}
                    onStatusUpdate={updateTestCaseStatus}
                    onPriorityUpdate={updateTestCasePriority}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <BugsTab 
          bugs={featureBugs}
          onAddBug={handleAddBug}
          onUpdateBugStatus={handleUpdateBugStatus}
        />
      )}

      {/* Edit Dialog */}
      <EditTestCaseDialog
        testCase={editingTestCase}
        isUpdating={isUpdating}
        onUpdate={updateTestCase}
        onClose={() => setEditingTestCase(null)}
      />
    </div>
  );
};

export default FeatureDetails;