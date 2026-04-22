import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/types/project';
import { projectService } from '@/services/project.service';
import { useToast } from '@/hooks/use-toast';

interface CreateProjectData {
  name: string;
  description: string;
}

export const useProjects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: projects = [], 
    isLoading, 
    error: projectsError 
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectService.fetchProjects(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      return await projectService.createProject(projectData);
    },
    onMutate: async (projectData) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
      
      const tempId = `temp-${Date.now()}`;
      const optimisticProject: Project = {
        _id: tempId,
        name: projectData.name,
        description: projectData.description,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Project[]>(['projects'], (old = []) => [...old, optimisticProject]);
      
      return { previousProjects, tempId };
    },
    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast({
        title: "Error Creating Project",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      });
    },
    onSuccess: (createdProject, variables, context) => {
      if (context?.tempId) {
        queryClient.setQueryData<Project[]>(['projects'], (old = []) => 
          old.map(p => p._id === context.tempId ? createdProject : p)
        );
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: `Project "${createdProject.name}" created successfully`,
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string | number) => {
      const idToDelete = String(projectId);
      await projectService.deleteProject(idToDelete);
      return idToDelete;
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData<Project[]>(['projects']);
      
      const idToDelete = String(projectId);
      queryClient.setQueryData<Project[]>(['projects'], (old = []) =>
        old.filter(p => String(p._id) !== idToDelete)
      );
      
      return { previousProjects };
    },
    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
  });

  const createProject = useCallback(async (projectData: CreateProjectData) => {
    if (!projectData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }
    
    return await createProjectMutation.mutateAsync(projectData);
  }, [createProjectMutation, toast]);

  const deleteProject = useCallback(async (projectId: string | number) => {
    return await deleteProjectMutation.mutateAsync(projectId);
  }, [deleteProjectMutation]);

  return {
    projects,
    isLoading,
    isCreating: createProjectMutation.isPending,
    error: projectsError,
    createProject,
    deleteProject,
  };
};
