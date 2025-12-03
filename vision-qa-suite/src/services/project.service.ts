// services/project.service.ts
import { Project } from '@/types/project';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_PROJECTS = import.meta.env.VITE_USE_MOCK_API === 'true';

// Helper function to transform backend project to frontend format
function transformProject(backendProject: any): Project {
  return {
    id: backendProject._id || backendProject.id,
    _id: backendProject._id,
    name: backendProject.name,
    description: backendProject.description || '',
    status: backendProject.status || 'active',
    userId: typeof backendProject.userId === 'object'
      ? backendProject.userId._id || backendProject.userId
      : backendProject.userId,
    featuresCount: backendProject.featuresCount || 0,
    testCasesCount: backendProject.testCasesCount || 0,
    bugsCount: backendProject.bugsCount || 0,
    progress: backendProject.progress || 0,
    lastUpdated: backendProject.updatedAt || backendProject.createdAt,
    createdAt: backendProject.createdAt,
    updatedAt: backendProject.updatedAt,
    srsDocument: backendProject.srsDocument,
    hasSRS: backendProject.srsDocument?.processed || false,
    srsFileName: backendProject.srsDocument?.fileName,
  };
}

// Simple in-memory mock projects to allow the UI to work without backend
const mockProjects: Project[] = [
  {
    id: 'mock-project-1',
    _id: 'mock-project-1',
    name: 'E‑Commerce Platform QA',
    description: 'QA workspace for testing authentication, cart, checkout and order flows.',
    status: 'active',
    userId: 'mock-user-1',
    featuresCount: 6,
    testCasesCount: 20,
    bugsCount: 3,
    progress: 65,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    hasSRS: true,
    srsFileName: 'SRS_Ecommerce_v1.pdf',
    srsDocument: {
      fileName: 'SRS_Ecommerce_v1.pdf',
      filePath: '',
      uploadedAt: new Date().toISOString() as unknown as Date,
      processed: true,
      chunksCount: 120,
    } as any,
  },
  {
    id: 'mock-project-2',
    _id: 'mock-project-2',
    name: 'Banking App QA',
    description: 'Testing transfers, accounts, and security requirements.',
    status: 'active',
    userId: 'mock-user-1',
    featuresCount: 4,
    testCasesCount: 12,
    bugsCount: 1,
    progress: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    hasSRS: false,
    srsFileName: undefined,
    srsDocument: undefined,
  },
];

export const projectService = {
  // Fetch all projects for the current user
  async fetchProjects(): Promise<Project[]> {
    if (USE_MOCK_PROJECTS) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const userId = localStorage.getItem('userId') || 'mock-user-1';
      return mockProjects.map((p) => ({ ...p, userId }));
    }

    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        console.warn('No userId found in localStorage');
        return [];
      }

      const response = await fetch(`${API_BASE_URL}/projects?userId=${userId}`, {
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
    if (USE_MOCK_PROJECTS) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const userId = localStorage.getItem('userId') || 'mock-user-1';
      const newProject: Project = {
        id: `mock-project-${mockProjects.length + 1}`,
        _id: `mock-project-${mockProjects.length + 1}`,
        name: projectData.name,
        description: projectData.description,
        status: 'active',
        userId,
        featuresCount: 0,
        testCasesCount: 0,
        bugsCount: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        hasSRS: false,
        srsFileName: undefined,
        srsDocument: undefined,
      };
      mockProjects.push(newProject);
      return newProject;
    }

    try {
      const userId = localStorage.getItem('userId') || 'default-user-id';

      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          ...projectData,
          userId,
        }),
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
    if (USE_MOCK_PROJECTS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const project = mockProjects.find((p) => p.id === projectId || p._id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    }

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
    if (USE_MOCK_PROJECTS) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const project = mockProjects.find((p) => p.id === projectId || p._id === projectId);
      if (project) {
        project.hasSRS = true;
        project.srsFileName = file.name;
        project.updatedAt = new Date().toISOString();
        project.lastUpdated = project.updatedAt;
      }
      return {
        success: true,
        message: 'SRS uploaded (mock) successfully',
        data: project,
      };
    }

    const formData = new FormData();
    formData.append('srs', file);

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/upload-srs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
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
    if (USE_MOCK_PROJECTS) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const index = mockProjects.findIndex((p) => p.id === projectId || p._id === projectId);
      if (index !== -1) {
        mockProjects.splice(index, 1);
      }
      return;
    }

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
