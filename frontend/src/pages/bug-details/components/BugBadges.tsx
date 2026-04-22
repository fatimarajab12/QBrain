import { Badge } from "@/components/ui/badge";
import { Bug } from "@/types/bug";
import { getStatusColor, getStatusIcon, getSeverityColor, getPriorityColor, getReproducibilityLabel } from "@/utils/bug-helpers";

interface BugBadgesProps {
  bug: Bug;
}

export const BugBadges = ({ bug }: BugBadgesProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <Badge className={`${getStatusColor(bug.status)} border font-semibold px-3 py-1`}>
        {getStatusIcon(bug.status)}
        <span className="ml-2">{bug.status}</span>
      </Badge>

      <Badge className={`${getSeverityColor(bug.severity)} border font-semibold px-3 py-1`}>
        {bug.severity}
      </Badge>

      <Badge className={`${getPriorityColor(bug.priority)} border font-semibold px-3 py-1`}>
        {bug.priority}
      </Badge>

      <Badge variant="outline" className="px-3 py-1">
        {getReproducibilityLabel(bug.reproducibility)}
      </Badge>
    </div>
  );
};

