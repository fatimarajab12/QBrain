import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Feature } from "@/types/feature";

interface FeatureHeaderProps {
  feature: Feature;
}

export const FeatureHeader = ({ feature }: FeatureHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <CardTitle className="text-2xl">{feature.name}</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            {feature.description}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};
