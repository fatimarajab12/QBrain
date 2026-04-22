import { CheckCircle2 } from "lucide-react";
import { Feature } from "@/types/feature";

interface FeatureAcceptanceCriteriaProps {
  acceptanceCriteria?: string[];
}

export const FeatureAcceptanceCriteria = ({ acceptanceCriteria }: FeatureAcceptanceCriteriaProps) => {
  if (!acceptanceCriteria || acceptanceCriteria.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Acceptance Criteria</h3>
      </div>
      <ul className="space-y-2 ml-7">
        {acceptanceCriteria.map((criteria, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-1.5">•</span>
            <span className="flex-1">{criteria}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

