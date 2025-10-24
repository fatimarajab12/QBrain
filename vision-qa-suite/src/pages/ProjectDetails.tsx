// pages/ProjectDetails.tsx
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus } from "lucide-react"; // أضف Plus هنا
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useFeatures } from "../hooks/useFeatures";
import FeatureCard from "./project-details/FeatureCard";
import CreateFeatureDialog from "./project-details/CreateFeatureDialog";
import EmptyState from "./project-details/EmptyState";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const {
    features,
    isLoading,
    isCreating,
    createFeature,
    updateFeatureStatus,
  } = useFeatures(projectId);

  const handleCreateFeature = async (featureData: { name: string; description: string }) => {
    await createFeature(featureData);
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
            <Button disabled className="gradient-primary opacity-50">
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Features</h1>
            <p className="text-muted-foreground">Manage features and generate test cases</p>
          </div>
          <CreateFeatureDialog 
            isCreating={isCreating}
            onCreate={handleCreateFeature}
          />
        </div>
      </div>

      {/* Features Grid */}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;