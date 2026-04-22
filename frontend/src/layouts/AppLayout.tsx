import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation, useParams, Navigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/Logo";
import ProjectChatBot from "@/components/ProjectChatBot";
import { projectService } from "@/services/project.service";
import { Project } from "@/types/project";
import { authStorage } from "@/utils/auth-helpers";

const AppLayout = () => {
  const location = useLocation();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authStorage.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        return;
      }
    };
    checkAuth();
  }, [location]);

  const projectId = useMemo(() => 
    params.projectId || location.pathname.match(/\/projects\/([^/]+)/)?.[1],
    [params.projectId, location.pathname]
  );

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectId ? projectService.fetchProjectById(projectId) : null,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setProject(projectData || null);
  }, [projectData]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} showText={true} textSize="lg" />
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto custom-scrollbar">
            <Outlet />
          </div>
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
