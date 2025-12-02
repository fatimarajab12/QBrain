// pages/project-details/FeatureCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
    <Card key={feature.id} className="shadow-soft border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-1">{feature.name}</CardTitle>
          <div className="flex items-center gap-2">
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
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
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
        <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{feature.testCasesCount}</div>
            <div className="text-xs text-muted-foreground">Test Cases</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{feature.bugsCount}</div>
            <div className="text-xs text-muted-foreground">Bugs</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{feature.progress}%</span>
          </div>
          <Progress value={feature.progress} />
        </div>
        <Link to={`/projects/${projectId}/features/${feature.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;