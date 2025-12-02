import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation, useParams } from "react-router-dom";
import Logo from "@/components/Logo";
import ProjectChatBot from "@/components/ProjectChatBot";
import { useEffect, useState } from "react";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";

const AppLayout = () => {
  const location = useLocation();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);

  // Extract projectId from URL
  const projectId = params.projectId || location.pathname.match(/\/projects\/(\d+)/)?.[1];

  // Fetch project details when projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const projectData = await projectService.fetchProjectById(projectId);
          setProject(projectData);
        } catch (error) {
          console.error("Error fetching project:", error);
          setProject(null);
        }
      } else {
        setProject(null);
      }
    };
    fetchProject();
  }, [projectId]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1">
          <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4">
            <SidebarTrigger />
            <Logo size={32} showText={true} textSize="md" className="hidden sm:flex" />
          </header>
          <Outlet />
        </main>
      </div>
      {/* Chatbot - only show when projectId exists */}
      {projectId && (
        <ProjectChatBot 
          projectId={projectId} 
          projectName={project?.name}
        />
      )}
    </SidebarProvider>
  );
};

export default AppLayout;
