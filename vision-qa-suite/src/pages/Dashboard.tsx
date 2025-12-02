// pages/Dashboard.tsx
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./dashboard/ProjectCard";
import CreateProjectDialog from "./dashboard/CreateProjectDialog";
import EmptyState from "./dashboard/EmptyState";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { projects, isLoading, isCreating, createProject, deleteProject } = useProjects();
  const { toast } = useToast();

  const handleCreateProject = async (projectData: { name: string; description: string }) => {
    try {
      const createdProject = await createProject(projectData);
      toast({
        title: "Project Created",
        description: "Project has been created successfully",
      });
      return createdProject ? { id: createdProject.id } : undefined;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    try {
      await deleteProject(projectId.toString());
      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Manage all your testing projects</p>
        </div>
        <CreateProjectDialog 
          isCreating={isCreating}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Statistics */}

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Projects</h2>
          <span className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {projects.length === 0 ? (
          <EmptyState onCreateProject={() => document.querySelector<HTMLButtonElement>('[data-testid="create-project-trigger"]')?.click()} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;