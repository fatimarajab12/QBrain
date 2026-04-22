import { Card, CardContent } from "@/components/ui/card";
import { Feature } from "@/types/feature";
import { FeatureHeader as FeatureHeaderComponent } from "./FeatureHeader";
import { FeaturePrioritySelector } from "./FeaturePrioritySelector";
import { FeatureAcceptanceCriteria } from "./FeatureAcceptanceCriteria";
import { FeatureTechnicalDetails } from "./FeatureTechnicalDetails";

interface FeatureInfoCardProps {
  feature: Feature;
  featureId: string;
  onPriorityChange: (priority: "High" | "Medium" | "Low") => Promise<void>;
  isUpdatingPriority: boolean;
}

const FeatureInfoCard = ({ feature, featureId, onPriorityChange, isUpdatingPriority }: FeatureInfoCardProps) => {
  return (
    <Card className="border-2">
      <div className="flex items-start justify-between pr-6 pt-6">
        <div className="flex-1">
          <FeatureHeaderComponent feature={feature} />
        </div>
        <div className="flex items-center gap-3">
          <FeaturePrioritySelector
            priority={feature.priority}
            onPriorityChange={onPriorityChange}
            isUpdating={isUpdatingPriority}
          />
        </div>
      </div>
      <CardContent className="space-y-6">
        <FeatureAcceptanceCriteria acceptanceCriteria={feature.acceptanceCriteria} />
        <FeatureTechnicalDetails feature={feature} featureId={featureId} />
      </CardContent>
    </Card>
  );
};

export default FeatureInfoCard;

