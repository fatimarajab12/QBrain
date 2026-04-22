import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TestTube, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestCase } from "@/types/test-case";
import { useProjectTestCases } from "@/hooks/useProjectTestCases";
import { useTestCaseFilters } from "@/pages/feature-details/hooks/useTestCaseFilters";
import { useFeatures } from "@/hooks/useFeatures";
import TestCasesContent from "@/pages/feature-details/components/TestCasesContent";
import EditTestCaseDialog from "@/pages/feature-details/EditTestCaseDialog";
import LoadingState from "./components/LoadingState";
import { useProjectData } from "./hooks/useProjectData";
import CreateTestCaseDialog from "@/pages/feature-details/CreateTestCaseDialog";

const TestCasesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { project } = useProjectData(projectId);
  const { features } = useFeatures(projectId);

  const {
    testCases,
    isLoading,
    isCreating,
    isUpdating,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    updateTestCaseStatus,
    updateTestCasePriority,
  } = useProjectTestCases(projectId);

  const { filteredTestCases, hasActiveFilters } = useTestCaseFilters({
    testCases,
    searchQuery,
    statusFilter,
    priorityFilter,
  });

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }, []);

  const handleEdit = useCallback((testCase: TestCase | null) => {
    setEditingTestCase(testCase);
  }, []);

  const handleDelete = useCallback(async (testCaseId: string) => {
    setIsDeleting(true);
    try {
      await deleteTestCase(testCaseId);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTestCase]);

  const handleStatusUpdate = useCallback(async (testCaseId: string, status: TestCase["status"]) => {
    if (status === "passed" || status === "failed") {
      await updateTestCaseStatus(testCaseId, status);
    }
  }, [updateTestCaseStatus]);

  const handlePriorityUpdate = useCallback(async (testCaseId: string, priority: TestCase["priority"]) => {
    await updateTestCasePriority(testCaseId, priority);
  }, [updateTestCasePriority]);

  const handleCreateTestCase = useCallback(async (testCaseData: Omit<TestCase, '_id'>) => {
    if (!testCaseData.featureId) {
      // User must select a feature when creating from project level
      return;
    }
    await createTestCase(testCaseData, testCaseData.featureId);
  }, [createTestCase]);

  const handleApproveTestCases = useCallback(async (approvedTestCases: TestCase[]) => {
    // This is for AI-generated test cases - not needed in project-level page
    // But keeping for compatibility
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TestTube className="h-6 w-6 text-cyan-600" />
            <h1 className="text-3xl font-bold">{project?.name || "Project"} - Test Cases</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage and execute all test cases for this project
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Test Cases Management</h2>
            <p className="text-muted-foreground">Execute and track test cases for this project</p>
          </div>
          <div className="flex gap-2">
            <CreateTestCaseDialog
              isCreating={isCreating}
              onCreate={handleCreateTestCase}
              features={features.map(f => ({ _id: f._id, name: f.name }))}
            />
          </div>
        </div>

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
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          {!!hasActiveFilters && (
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
      </div>

      {/* Content */}
      <TestCasesContent
        testCases={testCases}
        filteredTestCases={filteredTestCases}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={clearFilters}
        onCreateTestCase={handleCreateTestCase}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
        onPriorityUpdate={handlePriorityUpdate}
        isCreating={isCreating}
        isDeleting={isDeleting}
      />

      {/* Edit Dialog */}
      <EditTestCaseDialog
        testCase={editingTestCase}
        isUpdating={isUpdating}
        onUpdate={async (updatedTestCase) => {
          if (updatedTestCase._id) {
            try {
              await updateTestCase(updatedTestCase._id, updatedTestCase);
              setEditingTestCase(null);
            } catch (error) {
              // Error is already handled in the mutation
              console.error('Error updating test case:', error);
            }
          }
        }}
        onClose={() => {
          if (!isUpdating) {
            setEditingTestCase(null);
          }
        }}
      />
    </div>
  );
};

export default TestCasesPage;

