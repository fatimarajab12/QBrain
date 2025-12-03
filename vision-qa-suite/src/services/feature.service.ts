// services/feature.service.ts
import { Feature } from '@/types/feature';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Mock data - temporary until backend is ready
const mockFeatures: Feature[] = [
  {
    id: "1",
    name: "User Authentication",
    description: "Handles user login, registration, and password management. Includes secure session management and password reset functionality.",
    testCasesCount: 8,
    bugsCount: 2,
    status: "in-progress",
    progress: 65,
    projectId: "1",
    priority: "High",
    isAIGenerated: true,
    acceptanceCriteria: [
      "User can login with valid credentials",
      "User receives error for invalid credentials",
      "Password reset email is sent correctly",
      "Session expires after inactivity"
    ],
  },
  {
    id: "2",
    name: "Product Management",
    description: "Allows administrators to manage product catalog including adding, editing, and deleting products with image upload support.",
    testCasesCount: 12,
    bugsCount: 1,
    status: "pending",
    progress: 0,
    projectId: "1",
    priority: "Medium",
    isAIGenerated: true,
    acceptanceCriteria: [
      "Admin can add new products",
      "Admin can edit existing products",
      "Admin can delete products",
      "Product images can be uploaded"
    ],
  },
  {
    id: "3",
    name: "Checkout Process",
    description: "Handles shopping cart and payment processing with multiple payment methods support including credit cards and PayPal.",
    testCasesCount: 15,
    bugsCount: 0,
    status: "completed",
    progress: 100,
    projectId: "1",
    priority: "High",
    isAIGenerated: true,
    acceptanceCriteria: [
      "User can complete purchase",
      "Payment is processed securely",
      "Order confirmation email is sent",
      "Multiple payment methods are supported"
    ],
  },
  {
    id: "4",
    name: "Shopping Cart",
    description: "Users can add, remove, and update items in their shopping cart. Includes quantity management and price calculations.",
    testCasesCount: 6,
    bugsCount: 0,
    status: "in-progress",
    progress: 80,
    projectId: "1",
    priority: "High",
    isAIGenerated: false,
    acceptanceCriteria: [
      "User can add items to cart",
      "User can remove items from cart",
      "Cart total is calculated correctly",
      "Cart persists across sessions"
    ],
  },
  {
    id: "5",
    name: "User Profile Management",
    description: "Users can view and edit their profile information including personal details, address, and preferences.",
    testCasesCount: 5,
    bugsCount: 1,
    status: "pending",
    progress: 20,
    projectId: "1",
    priority: "Medium",
    isAIGenerated: false,
    acceptanceCriteria: [
      "User can view profile",
      "User can edit profile information",
      "Profile changes are saved correctly",
      "Profile picture can be uploaded"
    ],
  },
  {
    id: "6",
    name: "Order History",
    description: "Users can view their order history with detailed information about each order including status and tracking.",
    testCasesCount: 4,
    bugsCount: 0,
    status: "completed",
    progress: 100,
    projectId: "1",
    priority: "Low",
    isAIGenerated: true,
    acceptanceCriteria: [
      "User can view order history",
      "Order details are displayed correctly",
      "Order status is updated in real-time",
      "Users can track orders"
    ],
  },
];

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
    // Use mock data (either when USE_MOCK_API=true or until backend is fully ready)
    await new Promise(resolve => setTimeout(resolve, 800));
    const base = mockFeatures.filter(f => f.projectId === projectId).length > 0
      ? mockFeatures.filter(f => f.projectId === projectId)
      : mockFeatures.map(f => ({ ...f, projectId }));

    if (USE_MOCK_API) return base;

    /* API call - commented out for mock data
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
    */
  },

  // Create a new feature
  async createFeature(projectId: string, featureData: { name: string; description: string; priority?: string }): Promise<Feature> {
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newFeature: Feature = {
        id: (mockFeatures.length + 1).toString(),
        name: featureData.name,
        description: featureData.description,
        status: 'pending',
        progress: 0,
        projectId,
        priority: (featureData.priority as any) || 'Medium',
        testCasesCount: 0,
        bugsCount: 0,
        isAIGenerated: false,
        acceptanceCriteria: [],
      };
      mockFeatures.push(newFeature);
      return newFeature;
    }

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
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockFeatures.findIndex(f => f.id === featureId);
      if (index !== -1) {
        mockFeatures[index] = {
          ...mockFeatures[index],
          status,
        };
        return mockFeatures[index];
      }
      throw new Error('Feature not found');
    }

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
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockFeatures.findIndex(f => f.id === featureId);
      if (index === -1) {
        throw new Error('Feature not found');
      }
      mockFeatures[index] = {
        ...mockFeatures[index],
        ...featureData,
      };
      return mockFeatures[index];
    }

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
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockFeatures.findIndex(f => f.id === featureId);
      if (index !== -1) {
        mockFeatures.splice(index, 1);
      }
      return;
    }

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
    if (USE_MOCK_API) {
      // For mock mode, just reuse existing mock features and mark them as AI-generated for this project
      await new Promise(resolve => setTimeout(resolve, 1200));
      const generated = mockFeatures.map(f => ({
        ...f,
        id: `${projectId}-${f.id}`,
        projectId,
        isAIGenerated: true,
      }));
      return generated;
    }

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
    if (USE_MOCK_API) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const created: Feature[] = features.map((f, idx) => {
        const feature: Feature = {
          id: `${projectId}-ai-${Date.now()}-${idx}`,
          name: f.name,
          description: f.description,
          status: 'pending',
          progress: 0,
          projectId,
          priority: 'Medium',
          testCasesCount: f.testCases?.length || 0,
          bugsCount: 0,
          isAIGenerated: true,
          acceptanceCriteria: [],
        };
        mockFeatures.push(feature);
        return feature;
      });
      return created;
    }

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
