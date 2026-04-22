import { Feature } from "@/types/feature";
import FeatureCard from "../FeatureCard";
import FeaturesTable from "../FeaturesTable";
import EmptyState from "../EmptyState";

interface FeaturesContentProps {
  features: Feature[];
  filteredFeatures: Feature[];
  viewMode: "table" | "cards";
  projectId: string;
  onStatusChange: (featureId: string, newStatus: Feature["status"]) => void;
  onUpdate: (featureId: string, featureData: { name: string; description: string }) => Promise<void>;
  onDelete: (featureId: string) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

const FeaturesContent = ({
  features,
  filteredFeatures,
  viewMode,
  projectId,
  onStatusChange,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: FeaturesContentProps) => {
  if (features.length === 0) {
    return (
      <EmptyState 
        onCreateFeature={() => 
          document.querySelector<HTMLButtonElement>('[data-testid="create-feature-trigger"]')?.click()
        }
      />
    );
  }

  if (filteredFeatures.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium mb-2">No features found</p>
        <p className="text-sm">Try adjusting your filters or create a new feature</p>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredFeatures.length} of {features.length} features
      </div>
      {viewMode === "table" ? (
        <FeaturesTable
          features={filteredFeatures}
          projectId={projectId}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature._id}
              feature={feature}
              projectId={projectId}
              onStatusChange={onStatusChange}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default FeaturesContent;

