import React from "react";
import { PrefetchLink } from "@/components/shared/PrefetchLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Feature } from "@/types/feature";
import StatusDropdown from "./StatusDropdown";
import EditFeatureDialog from "./EditFeatureDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, FileText } from "lucide-react";

interface FeatureCardProps {
  feature: Feature;
  projectId: string;
  onStatusChange: (featureId: string, newStatus: Feature["status"]) => void;
  onUpdate?: (featureId: string, featureData: { name: string; description: string }) => Promise<void>;
  onDelete?: (featureId: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const FeatureCard = ({ 
  feature, 
  projectId, 
  onStatusChange, 
  onUpdate, 
  onDelete, 
  isUpdating = false,
  isDeleting = false 
}: FeatureCardProps) => {
  return (
    <Card className="h-full flex flex-col shadow-sm border-border hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group hover-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold line-clamp-2 mb-1.5 leading-tight">
              {feature.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onUpdate && (
              <EditFeatureDialog
                feature={feature}
                isUpdating={isUpdating}
                onUpdate={onUpdate}
              />
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{feature.name}"? This action cannot be undone and will permanently delete all associated test cases and bugs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(feature._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <StatusDropdown 
              feature={feature} 
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
        
        {feature.description && (
          <CardDescription className="text-base line-clamp-2 mb-2">
            {feature.description}
          </CardDescription>
        )}
        
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {feature.priority && (
            <Badge 
              variant="outline"
              className={`text-sm font-medium ${
                feature.priority === "High" 
                  ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
                  : feature.priority === "Medium"
                  ? "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400"
                  : "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
              }`}
            >
              {feature.priority}
            </Badge>
          )}
          {feature.featureType && (
            <Badge variant="outline" className="text-sm">
              {feature.featureType}
            </Badge>
          )}
        </div>
        
      </CardHeader>
      
      <CardContent className="pt-0 pb-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2.5 bg-muted/30 rounded-lg hover:bg-[hsl(var(--muted-hover))] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <div className="text-xl font-bold">{feature.testCasesCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Test Cases</div>
          </div>
          <div className="text-center p-2.5 bg-muted/30 rounded-lg hover:bg-[hsl(var(--muted-hover))] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            <div className="text-xl font-bold text-destructive">{feature.bugsCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Bugs</div>
          </div>
        </div>
        
        {feature.acceptanceCriteria && feature.acceptanceCriteria.length > 0 && (
          <div className="mb-3 text-xs text-muted-foreground">
            <div className="font-medium mb-1">Acceptance Criteria:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {feature.acceptanceCriteria.slice(0, 2).map((criteria, idx) => (
                <li key={`${criteria}-${idx}`} className="line-clamp-1">{criteria}</li>
              ))}
              {feature.acceptanceCriteria.length > 2 && (
                <li className="text-muted-foreground/70">+{feature.acceptanceCriteria.length - 2} more</li>
              )}
            </ul>
          </div>
        )}
        
        <PrefetchLink to={`/projects/${projectId}/features/${feature._id}`} className="block">
          <Button variant="outline" size="sm" className="w-full text-sm group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
            View Details
          </Button>
        </PrefetchLink>
      </CardContent>
    </Card>
  );
};

export default React.memo(FeatureCard, (prevProps, nextProps) => {
  return (
    prevProps.feature._id === nextProps.feature._id &&
    prevProps.feature.status === nextProps.feature.status &&
    prevProps.feature.name === nextProps.feature.name &&
    prevProps.feature.description === nextProps.feature.description &&
    prevProps.feature.priority === nextProps.feature.priority &&
    prevProps.feature.testCasesCount === nextProps.feature.testCasesCount &&
    prevProps.feature.bugsCount === nextProps.feature.bugsCount &&
    prevProps.isUpdating === nextProps.isUpdating &&
    prevProps.isDeleting === nextProps.isDeleting &&
    prevProps.projectId === nextProps.projectId
  );
});