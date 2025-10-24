// pages/FeatureDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useTestCases } from "../hooks/useTestCases";
import TestCaseCard from "./feature-details/TestCaseCard";
import CreateTestCaseDialog from "./feature-details/CreateTestCaseDialog";
import EditTestCaseDialog from "./feature-details/EditTestCaseDialog";
import StatsGrid from "./feature-details/StatsGrid";

const FeatureDetails = () => {
  const { projectId, featureId } = useParams();
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
  } = useTestCases(featureId ? parseInt(featureId) : undefined);

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
          
          <CreateTestCaseDialog
            isCreating={isCreating}
            onCreate={createTestCase}
          />
        </div>
      </div>

      {/* Statistics */}
      {testCases.length > 0 && <StatsGrid testCases={testCases} />}

      {/* Test Cases List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Test Cases ({testCases.length})
          </h2>
        </div>

        {testCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No test cases found. Create your first test case to get started.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <TestCaseCard
                key={testCase.id}
                testCase={testCase}
                onEdit={setEditingTestCase}
                onDelete={deleteTestCase}
                onStatusUpdate={updateTestCaseStatus}
              />
            ))}
          </div>
        )}
      </div>

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