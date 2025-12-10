// services/project.service.ts
import { Project } from '@/types/project';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to transform backend project to frontend format
function transformProject(backendProject: any): Project {
  // Ensure id is always a string (MongoDB ObjectId)
  const projectId = backendProject._id 
    ? String(backendProject._id) 
    : (backendProject.id ? String(backendProject.id) : '');
  
  return {
    id: projectId,
    _id: backendProject._id ? String(backendProject._id) : projectId,
    name: backendProject.name,
    description: backendProject.description || '',
    status: backendProject.status || 'active',
    userId: typeof backendProject.userId === 'object' 
      ? (backendProject.userId._id ? String(backendProject.userId._id) : String(backendProject.userId))
      : (backendProject.userId ? String(backendProject.userId) : undefined),
    featuresCount: backendProject.featuresCount || 0,
    testCasesCount: backendProject.testCasesCount || 0,
    bugsCount: backendProject.bugsCount || 0,
    progress: 0, // Will be calculated separately
    lastUpdated: backendProject.updatedAt || backendProject.createdAt,
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
    srsDocument: backendProject.srsDocument,
    hasSRS: backendProject.srsDocument?.processed || false,
    srsFileName: backendProject.srsDocument?.fileName,
  };
}

export const projectService = {
  // Fetch all projects for the current user
  async fetchProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch projects');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformProject);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Create a new project
  async createProject(projectData: { name: string; description: string }): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create project');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformProject(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Fetch project details including SRS status
  async fetchProjectById(projectId: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch project');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return transformProject(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Upload SRS document
  async uploadSRS(projectId: string, file: File): Promise<{ success: boolean; message: string; data?: any }> {
    const formData = new FormData();
    formData.append('srs', file); // Backend expects 'srs' field name

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/upload-srs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to upload SRS document');
    }

    const data = await response.json();
    return data;
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete project');
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // TODO: Add this function when backend is ready:
  // async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
  //   return apiClient.put(`/projects/${id}`, projectData);
  // },
};
