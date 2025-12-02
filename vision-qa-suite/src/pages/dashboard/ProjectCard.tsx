// pages/dashboard/components/ProjectCard.tsx
import { FolderKanban } from "lucide-react";
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
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <Card className="shadow-soft border-border hover:shadow-lg transition-shadow h-full relative group">
      <Link to={`/projects/${project.id}`} className="block">
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
          
          {/* Delete Button - appears on hover at bottom */}
          {onDelete && (
            <div className="pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently delete all associated features, test cases, and bugs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProjectCard;