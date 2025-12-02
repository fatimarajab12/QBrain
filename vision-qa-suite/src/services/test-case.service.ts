// services/test-case.service.ts
import { TestCase } from '@/types/test-case';

// Mock data - temporary until backend is ready
const mockTestCases: TestCase[] = [
  {
    id: 1,
    featureId: 1,
    title: "Verify login with valid credentials",
    priority: "high",
    status: "passed",
    preconditions: "User account exists in the system",
    steps: [
      "Navigate to login page",
      "Enter valid email address",
      "Enter valid password",
      "Click login button"
    ],
    expectedResult: "User successfully logged in and redirected to dashboard",
    actualResult: "User successfully logged in and redirected to dashboard",
    bugReports: [],
  },
  {
    id: 2,
    featureId: 1,
    title: "Verify login with invalid password",
    priority: "high",
    status: "failed",
    preconditions: "User account exists in the system",
    steps: [
      "Navigate to login page",
      "Enter valid email address",
      "Enter invalid password",
      "Click login button"
    ],
    expectedResult: "Error message displayed: 'Invalid email or password'",
    actualResult: "No error message displayed",
    bugReports: [1],
  },
  {
    id: 3,
    featureId: 1,
    title: "Verify empty field validation",
    priority: "medium",
    status: "pending",
    preconditions: "None",
    steps: [
      "Navigate to login page",
      "Leave email field empty",
      "Leave password field empty",
      "Click login button"
    ],
    expectedResult: "Validation errors displayed for both fields",
    actualResult: "",
    bugReports: [],
  },
];

export const testCaseService = {
  async fetchTestCases(featureId: number): Promise<TestCase[]> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockTestCases.filter(tc => tc.featureId === featureId).length > 0
      ? mockTestCases.filter(tc => tc.featureId === featureId)
      : mockTestCases.map(tc => ({ ...tc, featureId }));
  },

  async createTestCase(testCaseData: Omit<TestCase, 'id'>): Promise<TestCase> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newId = mockTestCases.length > 0
      ? Math.max(...mockTestCases.map(tc => tc.id)) + 1
      : 1;

    const testCaseToAdd: TestCase = {
      ...testCaseData,
      id: newId,
      featureId: testCaseData.featureId, // مهم للتوافق
    };

    mockTestCases.push(testCaseToAdd);
    return testCaseToAdd;
  },

  async updateTestCase(testCaseId: number, testCaseData: Partial<TestCase>): Promise<TestCase> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(testCaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update test case');
      }

      const data = await response.json();
      
      // Update mock data as fallback
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases[index] = { ...mockTestCases[index], ...data.data };
        return mockTestCases[index];
      }
      
      return data.data;
    } catch (error: any) {
      console.error('Error updating test case:', error);
      // Fallback to mock update
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases[index] = { ...mockTestCases[index], ...testCaseData };
        return mockTestCases[index];
      }
      throw error;
    }
  },

  async deleteTestCase(testCaseId: number): Promise<void> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete test case');
      }

      // Remove from mock data as fallback
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases.splice(index, 1);
      }
    } catch (error: any) {
      console.error('Error deleting test case:', error);
      // Fallback: remove from mock data anyway
      const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
      if (index !== -1) {
        mockTestCases.splice(index, 1);
      }
      throw error;
    }
  },

  async updateTestCaseStatus(testCaseId: number, status: "passed" | "failed"): Promise<TestCase> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      mockTestCases[index] = {
        ...mockTestCases[index],
        status,
        actualResult: status === "passed"
          ? mockTestCases[index].expectedResult
          : mockTestCases[index].actualResult || "Test failed - unexpected behavior",
      };
      return mockTestCases[index];
    }
    throw new Error('Test case not found');
  },

  // Generate test cases from feature using AI
  async generateAITestCases(featureId: string, options?: any): Promise<TestCase[]> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/generate-test-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ options: options || {} }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        // Transform backend test cases to frontend format
        return result.data.map((tc: any) => ({
          id: parseInt(tc._id || tc.id) || 0,
          title: tc.title || '',
          priority: (tc.priority?.toLowerCase() || 'medium') as "high" | "medium" | "low",
          status: (tc.status?.toLowerCase() || 'pending') as "passed" | "failed" | "pending",
          preconditions: tc.preconditions || '',
          steps: Array.isArray(tc.steps) ? tc.steps : [],
          expectedResult: tc.expectedResult || '',
          actualResult: tc.actualResult || '',
          bugReports: Array.isArray(tc.bugReports) ? tc.bugReports : [],
          featureId: typeof tc.featureId === 'object' 
            ? parseInt(tc.featureId._id || tc.featureId) || parseInt(featureId)
            : parseInt(tc.featureId || featureId),
          projectId: typeof tc.projectId === 'object'
            ? parseInt(tc.projectId._id || tc.projectId)
            : tc.projectId ? parseInt(tc.projectId) : undefined,
          createdAt: tc.createdAt,
          updatedAt: tc.updatedAt,
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  },
};
