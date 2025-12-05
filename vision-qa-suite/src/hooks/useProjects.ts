// hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/project.service';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projectsData = await projectService.fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; description: string }) => {
    if (!projectData.name.trim()) return;

    setIsCreating(true);
    try {
      const createdProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, createdProject]);
      return createdProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (projectId: string | number) => {
    try {
      // Ensure projectId is a string
      const idToDelete = String(projectId);
      await projectService.deleteProject(idToDelete);
      // Filter using string comparison to handle both string and number IDs
      setProjects(prev => prev.filter(p => String(p.id) !== idToDelete && String(p._id) !== idToDelete));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  return {
    projects,
    isLoading,
    isCreating,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  };
};