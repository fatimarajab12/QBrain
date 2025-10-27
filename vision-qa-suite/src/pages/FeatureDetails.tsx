// pages/FeatureDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTestCases } from "../hooks/useTestCases";
import TestCaseCard from "./feature-details/TestCaseCard";
import CreateTestCaseDialog from "./feature-details/CreateTestCaseDialog";
import EditTestCaseDialog from "./feature-details/EditTestCaseDialog";
import StatsGrid from "./feature-details/StatsGrid";
import BugsTab from "./feature-details/BugsTab";
import { Bug } from "@/types/bug";

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
  } = useTestCases(featureIdNum); ;
  
  const [activeTab, setActiveTab] = useState<"test-cases" | "bugs">("test-cases");
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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

  const handleGenerateTestCases = async () => {
    setIsGeneratingAI(true);
    try {
      // TODO: Call AI generation API
      // await generateTestCasesWithAI(featureId);
      console.log("Generating test cases with AI for feature:", featureId);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateBugs = async () => {
    setIsGeneratingAI(true);
    try {
      // TODO: Call AI generation API
      // await generateBugsWithAI(featureId);
      console.log("Generating bugs with AI for feature:", featureId);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsGeneratingAI(false);
    }
  };

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
                Test Cases ({testCases.length})
              </h2>
              <Button 
                onClick={handleGenerateTestCases}
                variant="outline"
                disabled={isGeneratingAI}
                className="gradient-ai"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingAI ? "Generating..." : "Generate with AI"}
              </Button>
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
                  <Button 
                    onClick={handleGenerateTestCases}
                    variant="outline"
                    disabled={isGeneratingAI}
                    className="gradient-ai"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGeneratingAI ? "Generating..." : "Generate with AI"}
                  </Button>
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
        </>
      ) : (
        <BugsTab 
          bugs={featureBugs}
          onAddBug={handleAddBug}
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