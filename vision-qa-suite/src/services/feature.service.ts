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
    projectId: 1,         // added
    isAIGenerated: false, // optional
  },
  {
    id: 2,
    name: "Add Product",
    description: "Product management and inventory",
    testCasesCount: 8,
    bugsCount: 0,
    status: "completed",
    progress: 100,
    projectId: 1,         // added
    isAIGenerated: false,
  },
  {
    id: 3,
    name: "Checkout Process",
    description: "Payment and order completion",
    testCasesCount: 15,
    bugsCount: 3,
    status: "in-progress",
    progress: 60,
    projectId: 1,         // added
    isAIGenerated: false,
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

  // TODO: Replace with real API when backend is ready  
 async createAIFeatures(projectId: number, features: Array<{
  name: string;
  description: string;
  testCases: Array<{
    title: string;
    steps: string[];
    expectedResult: string;
  }>;
}>): Promise<Feature[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const createdFeatures: Feature[] = [];
  let nextId = Math.max(...mockFeatures.map(f => f.id), 0) + 1;
  
  features.forEach(featureData => {
    const newFeature: Feature = {
      id: nextId++,
      name: featureData.name,
      description: featureData.description,
      testCasesCount: featureData.testCases.length,
      bugsCount: 0,
      status: "pending",
      progress: 0,
      projectId,
      isAIGenerated: true, // ✅ نميزها كمولدة بالذكاء الاصطناعي
    };
    
    mockFeatures.push(newFeature);
    createdFeatures.push(newFeature);
  });
  
  return createdFeatures;
}

};
