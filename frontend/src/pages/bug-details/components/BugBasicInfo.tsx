import { Link } from "react-router-dom";
import { Tag, ExternalLink, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bug } from "@/types/bug";

interface BugBasicInfoProps {
  bug: Bug;
  projectId?: string;
}

export const BugBasicInfo = ({ bug, projectId }: BugBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{bug.title}</h3>
          {bug.description && (
            <p className="text-muted-foreground">{bug.description}</p>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Feature:</span>
            <Link
              to={`/projects/${projectId}/features/${bug.featureId}`}
              className="text-primary hover:underline"
            >
              {bug.feature?.name || 'Unknown Feature'}
            </Link>
          </div>

          {bug.component && (
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Component:</span>
              <span className="font-medium">{bug.component}</span>
            </div>
          )}

          {bug.affectedUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Affected URL:</span>
              <a
                href={bug.affectedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {bug.affectedUrl}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

