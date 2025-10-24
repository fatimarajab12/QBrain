// services/feature.service.ts
import { Feature } from '@/types/feature';

// Mock data - temporary until backend is ready
const mockFeatures: Feature[] = [
  {
    id: 1,
    name: "User Login",
    description: "Authentication and login functionality",
    testCasesCount: 12,
    bugsCount: 2,
    status: "in-progress",
    progress: 75,
  },
  {
    id: 2,
    name: "Add Product",
    description: "Product management and inventory",
    testCasesCount: 8,
    bugsCount: 0,
    status: "completed",
    progress: 100,
  },
  {
    id: 3,
    name: "Checkout Process",
    description: "Payment and order completion",
    testCasesCount: 15,
    bugsCount: 3,
    status: "in-progress",
    progress: 60,
  },
];

export const featureService = {
  // TODO: Replace with real API when backend is ready
  async fetchFeatures(projectId: number): Promise<Feature[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockFeatures.filter(f => f.projectId === projectId).length > 0
      ? mockFeatures.filter(f => f.projectId === projectId)
      : mockFeatures.map(f => ({ ...f, projectId }));
  },

  // TODO: Replace with real API when backend is ready
  async createFeature(projectId: number, featureData: { name: string; description: string }): Promise<Feature> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newFeature: Feature = {
      id: Math.max(...mockFeatures.map(f => f.id), 0) + 1,
      name: featureData.name,
      description: featureData.description,
      testCasesCount: 0,
      bugsCount: 0,
      status: "pending",
      progress: 0,
      projectId,
    };

    mockFeatures.push(newFeature);
    return newFeature;
  },

  // TODO: Replace with real API when backend is ready
  async updateFeatureStatus(featureId: number, status: Feature["status"]): Promise<Feature> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockFeatures.findIndex(f => f.id === featureId);
    if (index !== -1) {
      const updatedFeature = {
        ...mockFeatures[index],
        status,
        progress: status === "completed" ? 100 : 
                 status === "in-progress" ? Math.max(mockFeatures[index].progress, 50) : 
                 mockFeatures[index].progress
      };
      
      mockFeatures[index] = updatedFeature;
      return updatedFeature;
    }
    throw new Error('Feature not found');
  },

  // TODO: Add these functions when backend is ready:
  // async updateFeature(featureId: number, featureData: Partial<Feature>): Promise<Feature> {
  //   return apiClient.put(`/features/${featureId}`, featureData);
  // },
  //
  // async deleteFeature(featureId: number): Promise<void> {
  //   return apiClient.delete(`/features/${featureId}`);
  // }
};