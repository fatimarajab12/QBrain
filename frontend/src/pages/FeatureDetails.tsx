import { useParams } from "react-router-dom";
import { useTestCases } from "@/hooks/useTestCases";
import EditTestCaseDialog from "./feature-details/EditTestCaseDialog";
import BugsTab from "./feature-details/BugsTab";
import FeatureHeaderBack from "./feature-details/components/FeatureHeaderBack";
import FeatureInfoCard from "./feature-details/components/FeatureInfoCard";
import FeatureTabs from "./feature-details/components/FeatureTabs";
import TestCasesToolbar from "./feature-details/components/TestCasesToolbar";
import TestCasesContent from "./feature-details/components/TestCasesContent";
import LoadingState from "./feature-details/components/LoadingState";
import { useFeatureData } from "./feature-details/hooks/useFeatureData";
import { useFeatureBugs } from "./feature-details/hooks/useFeatureBugs";
import { useTestCaseFilters } from "./feature-details/hooks/useTestCaseFilters";
import { useFeatureDetailsState } from "./feature-details/hooks/useFeatureDetailsState";

const FeatureDetails = () => {
  const { projectId, featureId } = useParams();

  const {
    feature,
    isLoadingFeature,
    bugs,
    isLoadingBugs,
    isUpdatingPriority,
    handlePriorityChange,
  } = useFeatureData(featureId);

  const {
    handleAddBug,
    handleUpdateBugStatus,
  } = useFeatureBugs({ featureId, projectId });

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
    bulkCreateTestCases,
    isCheckingAITestCases,
  } = useTestCases(featureId);

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    isDeleting,
    setIsDeleting,
    clearFilters,
  } = useFeatureDetailsState();

  const { filteredTestCases, hasActiveFilters } = useTestCaseFilters({
    testCases,
    searchQuery,
    statusFilter,
    priorityFilter,
  });

  const handleDeleteTestCase = async (testCaseId: string) => {
    setIsDeleting(true);
    try {
      await deleteTestCase(testCaseId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveTestCases = async (approvedTestCases: any[]) => {
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
  };

  const featureBugs = bugs.filter(bug => 
    featureId && (bug.featureId === featureId || bug.feature_id === featureId)
  );

  if (isLoading || isLoadingFeature) {
    return <LoadingState />;
  }

  return (
    <div className="p-8 space-y-6">
      <FeatureHeaderBack projectId={projectId} />

      {feature && (
        <FeatureInfoCard
          feature={feature}
          featureId={featureId!}
          onPriorityChange={handlePriorityChange}
          isUpdatingPriority={isUpdatingPriority}
        />
      )}

      <FeatureTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        testCasesCount={testCases.length}
        bugsCount={featureBugs.length}
      />

      {activeTab === "test-cases" ? (
        <>
          <TestCasesToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            hasActiveFilters={!!hasActiveFilters}
            onClearFilters={clearFilters}
            onCreateTestCase={async (testCase) => {
              await createTestCase(testCase as any);
            }}
            onApproveTestCases={handleApproveTestCases}
            featureId={featureId}
            feature={feature}
            isCreating={isCreating}
            isGenerating={isCreating || isCheckingAITestCases}
          />

          <TestCasesContent
            testCases={testCases}
            filteredTestCases={filteredTestCases}
            hasActiveFilters={!!hasActiveFilters}
            onClearFilters={clearFilters}
            onCreateTestCase={async (testCase) => {
              await createTestCase(testCase as any);
            }}
            onEdit={setEditingTestCase}
            onDelete={handleDeleteTestCase}
            onStatusUpdate={async (testCaseId, status) => {
              if (status === "passed" || status === "failed") {
                await updateTestCaseStatus(testCaseId, status);
              }
            }}
            onPriorityUpdate={async (testCaseId, priority) => {
              await updateTestCasePriority(testCaseId, priority);
            }}
            isCreating={isCreating}
            isDeleting={isDeleting}
          />
        </>
      ) : (
        <BugsTab 
          bugs={featureBugs}
          featureId={featureId}
          projectId={projectId}
          onAddBug={async (bugData) => {
            await handleAddBug(bugData);
          }}
          onUpdateBugStatus={handleUpdateBugStatus}
        />
      )}

      <EditTestCaseDialog
        testCase={editingTestCase}
        isUpdating={isUpdating}
        onUpdate={async (updatedTestCase) => {
          try {
            await updateTestCase(updatedTestCase);
            // Dialog will be closed by useTestCases hook on success
          } catch (error) {
            // Error is already handled in the mutation
            console.error('Error updating test case:', error);
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

export default FeatureDetails;
