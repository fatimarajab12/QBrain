// services/project.service.ts
import { Project } from '@/types/project';

// Mock data - temporary until backend is ready
const mockProjects: Project[] = [
  {
    id: 1,
    name: "POS Store System",
    description: "Testing point of sale application features",
    featuresCount: 8,
    testCasesCount: 45,
    bugsCount: 3,
    progress: 75,
    lastUpdated: "2024-01-15",
  },
  {
    id: 2,
    name: "OrangeHRM Testing",
    description: "Human resource management system QA",
    featuresCount: 12,
    testCasesCount: 68,
    bugsCount: 7,
    progress: 60,
    lastUpdated: "2024-01-14",
  },
  {
    id: 3,
    name: "E-Commerce Platform",
    description: "Online shopping platform testing",
    featuresCount: 15,
    testCasesCount: 92,
    bugsCount: 5,
    progress: 82,
    lastUpdated: "2024-01-16",
  },
];

export const projectService = {
  // TODO: Replace with real API when backend is ready
  async fetchProjects(): Promise<Project[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockProjects;
  },

  // TODO: Replace with real API when backend is ready
  async createProject(projectData: { name: string; description: string }): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newId = mockProjects.length > 0 ? Math.max(...mockProjects.map(p => p.id)) + 1 : 1;

    const createdProject: Project = {
      id: newId,
      name: projectData.name,
      description: projectData.description,
      featuresCount: 0,
      testCasesCount: 0,
      bugsCount: 0,
      progress: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    mockProjects.push(createdProject);
    return createdProject;
  }
  ,

  // TODO: Add these functions when backend is ready:
  // async fetchProjectById(id: number): Promise<Project> {
  //   return apiClient.get(`/projects/${id}`);
  // },
  //
  // async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
  //   return apiClient.put(`/projects/${id}`, projectData);
  // },
  //
  // async deleteProject(id: number): Promise<void> {
  //   return apiClient.delete(`/projects/${id}`);
  // }
};