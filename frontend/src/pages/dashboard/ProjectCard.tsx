import React from "react";
import { FolderKanban, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchProject, prefetchFeatures } from "@/utils/navigation";
import { Project } from "@/types/project";
import { logger } from "@/utils/logger";
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
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string | number) => void;
  isDeleting?: boolean;
}

const ProjectCard = ({ project, onDelete, isDeleting = false }: ProjectCardProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const projectId = String(project._id);
    prefetchProject(queryClient, projectId);
    prefetchFeatures(queryClient, projectId);
    navigate(`/projects/${projectId}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      try {
        await onDelete(project._id);
      } catch (error) {
        logger.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Card className="shadow-sm border-border/60 hover:shadow-xl hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 h-full relative group flex flex-col hover-card">
      <div onClick={handleClick} className="block flex-1 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-1">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold">{project.featuresCount || 0}</div>
              <div className="text-sm text-muted-foreground">Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{project.testCasesCount || 0}</div>
              <div className="text-sm text-muted-foreground">Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{project.bugsCount || 0}</div>
              <div className="text-sm text-muted-foreground">Bugs</div>
            </div>
          </div>
        </CardContent>
      </div>
      
      {onDelete && (
        <div className="px-6 pb-4 pt-3 border-t border-border/40 bg-muted/20 backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 relative z-10">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 text-base font-medium shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4 sm:mx-0">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently delete:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All features ({project.featuresCount || 0})</li>
                    <li>All test cases ({project.testCasesCount || 0})</li>
                    <li>All bugs ({project.bugsCount || 0})</li>
                    <li>SRS document and all vector data from Supabase</li>
                    <li>All associated data from MongoDB and Supabase</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel className="w-full sm:w-auto" disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Card>
  );
};

export default React.memo(ProjectCard, (prevProps, nextProps) => {
  return (
    prevProps.project._id === nextProps.project._id &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.description === nextProps.project.description &&
    prevProps.project.featuresCount === nextProps.project.featuresCount &&
    prevProps.project.testCasesCount === nextProps.project.testCasesCount &&
    prevProps.project.bugsCount === nextProps.project.bugsCount &&
    prevProps.isDeleting === nextProps.isDeleting
  );
});
