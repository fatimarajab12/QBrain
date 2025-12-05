// services/feature.service.ts
import { Feature } from '@/types/feature';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to transform backend feature to frontend format
function transformFeature(backendFeature: any): Feature {
  // Map backend status to frontend status
  const statusMap: Record<string, Feature['status']> = {
    'pending': 'pending',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'blocked': 'blocked',
  };

  // Calculate progress based on status
  const progressMap: Record<string, number> = {
    'pending': 0,
    'in_progress': 50,
    'completed': 100,
    'blocked': 0,
  };

  return {
    id: backendFeature._id || backendFeature.id,
    _id: backendFeature._id,
    name: backendFeature.name,
    description: backendFeature.description || '',
    testCasesCount: backendFeature.testCasesCount || 0,
    bugsCount: 0, // Will be calculated separately if needed
    status: statusMap[backendFeature.status] || 'pending',
    progress: progressMap[backendFeature.status] || 0,
    projectId: typeof backendFeature.projectId === 'object' 
      ? backendFeature.projectId._id || backendFeature.projectId 
      : backendFeature.projectId,
    priority: backendFeature.priority || 'Medium',
    createdAt: backendFeature.createdAt,
    updatedAt: backendFeature.updatedAt,
    isAIGenerated: backendFeature.isAIGenerated || false,
    acceptanceCriteria: backendFeature.acceptanceCriteria || [],
    reasoning: backendFeature.reasoning || undefined,
    matchedSections: backendFeature.matchedSections || [],
    confidence: backendFeature.confidence || undefined,
    relevanceScore: backendFeature.relevanceScore || undefined,
    rankingScore: backendFeature.rankingScore || undefined,
  };
}

export const featureService = {
  // Fetch features for a project
  async fetchFeatures(projectId: string): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/features`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch features');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformFeature);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching features:', error);
      throw error;
    }
  },

  // Get a single feature by ID
  async getFeature(featureId: string): Promise<Feature> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch feature');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformFeature(result.data);
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Error fetching feature:', error);
      throw error;
    }
  },

  // Create a new feature
  async createFeature(projectId: string, featureData: { name: string; description: string; priority?: string; acceptanceCriteria?: string[] }): Promise<Feature> {
    try {
      const response = await fetch(`${API_BASE_URL}/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          ...featureData,
          projectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create feature');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformFeature(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error creating feature:', error);
      throw error;
    }
  },

  // Update feature status
  async updateFeatureStatus(featureId: string, status: Feature["status"]): Promise<Feature> {
    try {
      // Map frontend status to backend status
      const statusMap: Record<string, string> = {
        'pending': 'pending',
        'in-progress': 'in_progress',
        'completed': 'completed',
        'blocked': 'blocked',
      };

      const backendStatus = statusMap[status] || status;

      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update feature status');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformFeature(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error updating feature status:', error);
      throw error;
    }
  },

  // Update feature
  async updateFeature(featureId: string, featureData: { name: string; description: string; priority?: string }): Promise<Feature> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(featureData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update feature');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformFeature(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error updating feature:', error);
      throw error;
    }
  },

  // Delete feature
  async deleteFeature(featureId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete feature');
      }

      // Success - no need to return anything
    } catch (error: any) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  },


  // Generate features from SRS using AI
  async generateAIFeatures(projectId: string, options?: any): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/generate-features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ options: options || {} }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate features');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformFeature);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error generating AI features:', error);
      throw error;
    }
  },

  // Bulk create features (for AI-generated features)
  async createAIFeatures(projectId: string, features: Array<{
    name: string;
    description: string;
    priority?: string;
    acceptanceCriteria?: string[];
    testCases?: Array<{
      title: string;
      steps: string[];
      expectedResult: string;
    }>;
  }>): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          projectId,
          features: features.map(f => ({
            name: f.name,
            description: f.description,
            priority: f.priority || "Medium",
            acceptanceCriteria: f.acceptanceCriteria || [],
            isAIGenerated: true,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create features');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformFeature);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error creating AI features:', error);
      throw error;
    }
  },

  // Get performance metrics for a project
  async getPerformanceMetrics(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/performance-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get performance metrics');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  },

  // Check if project has AI-generated features
  async hasAIGeneratedFeatures(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/has-ai-features`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to check AI-generated features');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.hasAIGenerated || false;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error checking AI-generated features:', error);
      throw error;
    }
  },
};
