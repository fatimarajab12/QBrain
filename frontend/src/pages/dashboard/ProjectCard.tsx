// pages/dashboard/components/ProjectCard.tsx
import { FolderKanban, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
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
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      try {
        // Use _id if available (MongoDB ObjectId), otherwise use id
        const projectIdToDelete = project._id || project.id;
        await onDelete(projectIdToDelete);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  return (
    <Card className="shadow-soft border-border hover:shadow-lg transition-shadow h-full relative group flex flex-col">
      <Link to={`/projects/${project.id}`} className="block flex-1">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-1">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
            </div>
            <FolderKanban className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold">{project.featuresCount}</div>
              <div className="text-xs text-muted-foreground">Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{project.testCasesCount}</div>
              <div className="text-xs text-muted-foreground">Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{project.bugsCount}</div>
              <div className="text-xs text-muted-foreground">Bugs</div>
            </div>
          </div>
        </CardContent>
      </Link>
      
      {/* Delete Button - appears on hover at bottom, always visible on mobile - Outside Link */}
      {onDelete && (
        <div className="px-6 pb-4 pt-2 border-t border-border opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                Delete
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default ProjectCard;
