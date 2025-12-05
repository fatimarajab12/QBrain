// pages/project-details/FeatureCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";

interface FeatureCardProps {
  feature: Feature;
  projectId: string;
  onStatusChange: (featureId: number, newStatus: Feature["status"]) => void;
  onUpdate?: (featureId: number, featureData: { name: string; description: string }) => Promise<void>;
  onDelete?: (featureId: number) => Promise<void>;
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
    <Card key={feature.id} className="h-full flex flex-col shadow-sm border-border hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        {/* Header Row: Actions + Status */}
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
                      onClick={() => onDelete(feature.id)}
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
        
        {/* Description */}
        {feature.description && (
          <CardDescription className="text-sm line-clamp-2 mb-2">
            {feature.description}
          </CardDescription>
        )}
        
        {/* Priority Badge */}
        {feature.priority && (
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
              feature.priority === "High" 
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : feature.priority === "Medium"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {feature.priority}
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 pb-4 flex-1 flex flex-col justify-between">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold">{feature.testCasesCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Test Cases</div>
          </div>
          <div className="text-center p-2.5 bg-muted/30 rounded-lg">
            <div className="text-xl font-bold text-destructive">{feature.bugsCount || 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Bugs</div>
          </div>
        </div>
        
        {/* View Details Button */}
        <Link to={`/projects/${projectId}/features/${feature._id || feature.id}`} className="block">
          <Button variant="outline" size="sm" className="w-full text-sm">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;