import { Feature } from '@/types/feature';
import { authStorage } from '@/utils/auth-helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function transformFeature(backendFeature: any): Feature {
  const statusMap: Record<string, Feature['status']> = {
    'pending': 'pending',
    'in_progress': 'in-progress',
    'completed': 'completed',
    'blocked': 'blocked',
  };

  const progressMap: Record<string, number> = {
    'pending': 0,
    'in_progress': 50,
    'completed': 100,
    'blocked': 0,
  };

  let featureType: Feature['featureType'] = undefined;
  if (backendFeature.metadata) {
    if (backendFeature.metadata instanceof Map) {
      featureType = backendFeature.metadata.get('featureType') as Feature['featureType'];
    } else if (typeof backendFeature.metadata === 'object') {
      featureType = backendFeature.metadata.featureType as Feature['featureType'];
    }
  }
  if (!featureType && backendFeature.featureType) {
    featureType = backendFeature.featureType as Feature['featureType'];
  }

  const _id = String(backendFeature._id || backendFeature.id || '');
  if (!_id || _id === 'undefined' || _id === 'null') {
    throw new Error('Invalid feature object from server (missing _id)');
  }

  return {
    _id,
    name: backendFeature.name,
    description: backendFeature.description || '',
    testCasesCount: backendFeature.testCasesCount || 0,
    bugsCount: backendFeature.bugsCount || 0,
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
    featureType: featureType,
    metadata: backendFeature.metadata ? (typeof backendFeature.metadata === 'object' && !(backendFeature.metadata instanceof Map) 
      ? backendFeature.metadata 
      : Object.fromEntries(backendFeature.metadata instanceof Map ? backendFeature.metadata : [])) : undefined,
  };
}

export const featureService = {
  async fetchFeatures(projectId: string): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/features`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async getFeature(featureId: string): Promise<Feature> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async createFeature(projectId: string, featureData: { 
    name: string; 
    description: string; 
    priority?: string; 
    featureType?: string;
    acceptanceCriteria?: string[];
    matchedSections?: string[];
    reasoning?: string;
  }): Promise<Feature> {
    try {
      if (!projectId || !projectId.trim()) {
        throw new Error('Project ID is required to create a feature');
      }

      if (!featureData.name || !featureData.name.trim()) {
        throw new Error('Feature name is required');
      }

      const response = await fetch(`${API_BASE_URL}/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
        body: JSON.stringify({
          ...featureData,
          projectId: projectId.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Failed to create feature (Status: ${response.status})`;
        
        // Provide more specific error messages
        if (response.status === 400) {
          throw new Error(`Validation Error: ${errorMessage}. Please check that all required fields are filled correctly.`);
        } else if (response.status === 401) {
          throw new Error('Authentication Error: Please log in again to create features.');
        } else if (response.status === 404) {
          throw new Error(`Project Not Found: The project with ID "${projectId}" does not exist.`);
        } else if (response.status === 409) {
          throw new Error(`Conflict: ${errorMessage}. A feature with this name may already exist in the project.`);
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformFeature(result.data);
      }
      
      throw new Error('Invalid response from server: Missing feature data in response');
    } catch (error: any) {
      console.error('Error creating feature:', error);
      // Re-throw with clear message
      if (error.message) {
        throw error;
      }
      throw new Error('An unexpected error occurred while creating the feature. Please try again.');
    }
  },

  async updateFeatureStatus(featureId: string, status: Feature["status"]): Promise<Feature> {
    try {
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
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async updateFeature(featureId: string, featureData: { name: string; description: string; priority?: string; reasoning?: string | null; featureType?: string | null; matchedSections?: string[] }): Promise<Feature> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async deleteFeature(featureId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/${featureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async generateAIFeatures(projectId: string, options?: any): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/generate-features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async getPerformanceMetrics(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/performance-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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

  async hasAIGeneratedFeatures(projectId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}/has-ai-features`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
