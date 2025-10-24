// pages/dashboard/components/ProjectCard.tsx
import { FolderKanban } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="shadow-soft border-border hover:shadow-lg transition-shadow cursor-pointer h-full">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProjectCard;