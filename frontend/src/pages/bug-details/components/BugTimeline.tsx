import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "@/types/bug";
import { formatDate } from "@/utils/bug-helpers";

interface BugTimelineProps {
  bug: Bug;
}

export const BugTimeline = ({ bug }: BugTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">{formatDate(bug.createdAt)}</span>
        </div>

        {bug.firstOccurrenceDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">First occurrence</span>
            <span className="text-sm">{formatDate(bug.firstOccurrenceDate)}</span>
          </div>
        )}

        {bug.lastOccurrenceDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last occurrence</span>
            <span className="text-sm">{formatDate(bug.lastOccurrenceDate)}</span>
          </div>
        )}

        {bug.resolvedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Resolved</span>
            <span className="text-sm">{formatDate(bug.resolvedAt)}</span>
          </div>
        )}

        {bug.closedAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Closed</span>
            <span className="text-sm">{formatDate(bug.closedAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

