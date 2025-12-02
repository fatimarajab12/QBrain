// pages/ProjectDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useFeatures } from "../hooks/useFeatures";
import FeatureCard from "./project-details/FeatureCard";
import CreateFeatureDialog from "./project-details/CreateFeatureDialog";
import EmptyState from "./project-details/EmptyState";
import BugsTab from "./project-details/BugTab";
import { Bug } from "@/types/bug";
import GooeyTabs from "@/components/ui/gooey-tabs";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";

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
  },
  { 
    id: 3, 
    title: "UI alignment", 
    description: "Login form elements misaligned on mobile",
    feature_id: 2, 
    project_id: 1, 
    severity: "Low" as const, 
    status: "Open" as const,
    created_at: "2024-01-16T11:45:00Z",
    updated_at: "2024-01-16T11:45:00Z"
  }
];

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const {
    features,
    isLoading,
    isCreating,
    createFeature,
    updateFeatureStatus,
    updateFeature,
    deleteFeature,
  } = useFeatures(projectId);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"features" | "bugs">("features");
  const [bugs, setBugs] = useState<Bug[]>(mockBugs);
  const [project, setProject] = useState<Project | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const projectData = await projectService.fetchProjectById(projectId);
          setProject(projectData);
        } catch (error) {
          console.error("Error fetching project:", error);
        }
      }
    };
    fetchProject();
  }, [projectId]);

  // TODO: Fetch bugs from API
  useEffect(() => {
    // fetchBugs(projectId).then(setBugs);
    console.log("Fetching bugs for project:", projectId);
  }, [projectId]);

  const handleCreateFeature = async (featureData: { name: string; description: string }) => {
    if (!projectId) return;
    await createFeature(featureData);
  };

  const handleUpdateFeature = async (featureId: number, featureData: { name: string; description: string }) => {
    setIsUpdating(true);
    try {
      await updateFeature(featureId, featureData);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFeature = async (featureId: number) => {
    setIsDeleting(true);
    try {
      await deleteFeature(featureId);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleAddBug = (bugData: Omit<Bug, 'id' | 'created_at' | 'updated_at'>) => {
    // TODO: Replace with API call
    const newBug: Bug = {
      ...bugData,
      id: Math.max(...bugs.map(b => b.id), 0) + 1,
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Features</h1>
              <p className="text-muted-foreground">Manage features and generate test cases</p>
            </div>
            <Button disabled className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 opacity-50">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Features</h1>
          <p className="text-muted-foreground">Manage features and generate test cases</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("features")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "features"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Features ({features.length})
            </button>
            <button
              onClick={() => setActiveTab("bugs")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "bugs"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              Bugs ({bugs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "features" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <CreateFeatureDialog 
              isCreating={isCreating}
              onCreate={handleCreateFeature}
            />
          </div>
          {features.length === 0 ? (
            <EmptyState 
              onCreateFeature={() => document.querySelector<HTMLButtonElement>('[data-testid="create-feature-trigger"]')?.click()}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  projectId={projectId!}
                  onStatusChange={updateFeatureStatus}
                  onUpdate={handleUpdateFeature}
                  onDelete={handleDeleteFeature}
                  isUpdating={isUpdating}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <BugsTab 
          bugs={bugs} 
          features={features}
          onAddBug={handleAddBug}
          onUpdateBugStatus={handleUpdateBugStatus}
        />
      )}
    </div>
  );
};

export default ProjectDetails; 