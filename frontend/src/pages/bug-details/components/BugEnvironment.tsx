import { Monitor, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "@/types/bug";

interface BugEnvironmentProps {
  environment?: Bug['environment'];
}

export const BugEnvironment = ({ environment }: BugEnvironmentProps) => {
  if (!environment) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Environment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {environment.os && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">OS:</span>
            <span className="font-medium">{environment.os}</span>
          </div>
        )}

        {environment.appType && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">App Type:</span>
            <span className="font-medium">{environment.appType}</span>
          </div>
        )}

        {environment.browser && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Browser:</span>
            <span className="font-medium">
              {environment.browser}
              {environment.browserVersion && ` ${environment.browserVersion}`}
            </span>
          </div>
        )}

        {environment.appVersion && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Version:</span>
            <span className="font-medium">{environment.appVersion}</span>
          </div>
        )}

        {environment.build && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Build:</span>
            <span className="font-medium">{environment.build}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

