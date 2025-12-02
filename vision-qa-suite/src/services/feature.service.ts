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
  };
}

export const featureService = {
  // Fetch features for a project
  async fetchFeatures(projectId: string): Promise<Feature[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/features/projects/${projectId}`, {
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

  // Create a new feature
  async createFeature(projectId: string, featureData: { name: string; description: string; priority?: string }): Promise<Feature> {
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

  // TODO: Replace with real API when backend is ready
  async analyzeRequirements(requirementsText: string): Promise<{
    features: Array<{
      name: string;
      description: string;
      testCases: Array<{
        title: string;
        steps: string[];
        expectedResult: string;
      }>;
    }>;
  }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock response - replace with actual API
    // Actual API should accept: POST /api/ai/analyze-requirements { requirements: string }
    const hasAuthKeywords = /login|auth|password|user|register/i.test(requirementsText);
    const hasProductKeywords = /product|item|inventory|catalog/i.test(requirementsText);
    const hasPaymentKeywords = /payment|checkout|order|cart/i.test(requirementsText);
    
    const features = [];
    
    if (hasAuthKeywords) {
      features.push({
        name: "User Authentication",
        description: "Handles user login, registration, and password management",
        testCases: [
          {
            title: "Login with valid credentials",
            steps: ["Navigate to login page", "Enter valid email", "Enter valid password", "Click login button"],
            expectedResult: "User should be redirected to dashboard"
          },
          {
            title: "Login with invalid password", 
            steps: ["Navigate to login page", "Enter valid email", "Enter wrong password", "Click login button"],
            expectedResult: "Error message should appear"
          },
          {
            title: "Forgot password functionality",
            steps: ["Click forgot password link", "Enter registered email", "Submit request"],
            expectedResult: "Password reset email should be sent"
          }
        ]
      });
    }
    
    if (hasProductKeywords) {
      features.push({
        name: "Product Management",
        description: "Allows administrators to manage product catalog",
        testCases: [
          {
            title: "Add new product",
            steps: ["Navigate to products page", "Click add product button", "Fill product details", "Save product"],
            expectedResult: "New product should appear in product list"
          },
          {
            title: "Edit existing product",
            steps: ["Click on product to edit", "Modify product details", "Save changes"],
            expectedResult: "Product details should be updated"
          }
        ]
      });
    }
    
    if (hasPaymentKeywords) {
      features.push({
        name: "Checkout Process",
        description: "Handles shopping cart and payment processing",
        testCases: [
          {
            title: "Complete purchase with valid payment",
            steps: ["Add items to cart", "Proceed to checkout", "Enter payment details", "Confirm purchase"],
            expectedResult: "Order should be confirmed and receipt generated"
          }
        ]
      });
    }
    
    // Fallback if no specific keywords detected
    if (features.length === 0) {
      features.push({
        name: "Core System Features",
        description: "Main functionality based on provided requirements",
        testCases: [
          {
            title: "Basic system functionality",
            steps: ["Access the system", "Perform basic operations"],
            expectedResult: "System should respond as expected"
          }
        ]
      });
    }
    
    return { features };
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
};
