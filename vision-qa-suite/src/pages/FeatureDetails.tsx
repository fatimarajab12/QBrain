// pages/FeatureDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Search, X, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useTestCases } from "../hooks/useTestCases";
import TestCaseCard from "./feature-details/TestCaseCard";
import CreateTestCaseDialog from "./feature-details/CreateTestCaseDialog";
import EditTestCaseDialog from "./feature-details/EditTestCaseDialog";
import StatsGrid from "./feature-details/StatsGrid";
import BugsTab from "./feature-details/BugsTab";
import { Bug } from "@/types/bug";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { TestCase } from "@/types/test-case";

// Mock bugs data - to be replaced with API calls
const mockBugs: Bug[] = [
  { 
    id: 1, 
    title: "Session expired", 
    description: "User session expires too quickly after login",
    feature_id: 1, 
    project_id: 1, 
    severity: "High" as const, 
    status: "Open" as const,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  { 
    id: 2, 
    title: "Password validation", 
    description: "Password requirements not clearly displayed",
    feature_id: 1, 
    project_id: 1, 
    severity: "Medium" as const, 
    status: "In Progress" as const,
    created_at: "2024-01-14T14:20:00Z",
    updated_at: "2024-01-15T09:15:00Z"
  }
];

const FeatureDetails = () => {
  const { projectId, featureId } = useParams();
  const { toast } = useToast();

  const featureIdNum = featureId ? parseInt(featureId, 10) : undefined;
  const projectIdNum = projectId ? parseInt(projectId, 10) : undefined;
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
  } = useTestCases(featureIdNum);
  
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"test-cases" | "bugs">("test-cases");
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // TODO: Fetch bugs from API
  useEffect(() => {
    if (featureId) {
      // fetchBugsByFeature(featureId).then(setBugs);
      console.log("Fetching bugs for feature:", featureId);
    }
  }, [featureId]);

  // Filter bugs for this specific feature
const featureBugs = bugs.filter(bug => 
  featureId && bug.feature_id.toString() === featureId
);


const handleAddBug = (bugData: Omit<Bug, 'id' | 'created_at' | 'updated_at'>) => {
  if (!featureId || !projectId) return;
  
  const newBug: Bug = {
    ...bugData,
    id: Math.max(...bugs.map(b => b.id), 0) + 1,
    feature_id: parseInt(featureId),
    project_id: parseInt(projectId),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  setBugs(prev => [...prev, newBug]);
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
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Features
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Test Cases Management</h1>
            <p className="text-muted-foreground">Execute and track test cases</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateTestCases()}
              disabled={isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
            <CreateTestCaseDialog
              isCreating={isCreating}
              onCreate={createTestCase}
            />
          </div>
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
                <SelectTrigger className="w-full sm:w-[150px]">
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
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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