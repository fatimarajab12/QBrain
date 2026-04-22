import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bug } from "@/types/bug";
import { formatDate } from "@/utils/bug-helpers";

interface BugPeopleProps {
  bug: Bug;
}

export const BugPeople = ({ bug }: BugPeopleProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          People
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(bug.reportedByUser?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Reported by</p>
            <p className="text-sm text-muted-foreground">
              {bug.reportedByUser?.name || 'Unknown'} • {formatDate(bug.createdAt)}
            </p>
          </div>
        </div>

        {bug.assignedToUser && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {bug.assignedToUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Assigned to</p>
              <p className="text-sm text-muted-foreground">
                {bug.assignedToUser.name}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

