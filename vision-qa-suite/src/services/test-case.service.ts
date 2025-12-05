// services/test-case.service.ts
import { TestCase } from '@/types/test-case';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to convert MongoDB ObjectId to number using hash
function getId(id: any): number {
  if (!id) return 0;
  const idStr = typeof id === 'object' ? (id._id || id.id || '').toString() : id.toString();
  if (!idStr) return 0;
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    const char = idStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Helper function to transform backend test case to frontend format
function transformTestCase(backendTestCase: any): TestCase {
  return {
    id: getId(backendTestCase._id || backendTestCase.id),
    title: backendTestCase.title || '',
    description: backendTestCase.description || undefined,
    priority: (backendTestCase.priority?.toLowerCase() || 'medium') as "high" | "medium" | "low",
    status: (backendTestCase.status?.toLowerCase() || 'pending') as "passed" | "failed" | "pending" | "in_progress" | "blocked",
    preconditions: backendTestCase.preconditions || '',
    steps: Array.isArray(backendTestCase.steps) ? backendTestCase.steps : [],
    expectedResult: backendTestCase.expectedResult || '',
    actualResult: backendTestCase.actualResult || '',
    bugReports: Array.isArray(backendTestCase.bugReports) ? backendTestCase.bugReports : [],
    featureId: typeof backendTestCase.featureId === 'object' 
      ? getId(backendTestCase.featureId._id || backendTestCase.featureId)
      : getId(backendTestCase.featureId || '0'),
    projectId: typeof backendTestCase.projectId === 'object'
      ? getId(backendTestCase.projectId._id || backendTestCase.projectId)
      : backendTestCase.projectId ? getId(backendTestCase.projectId) : undefined,
    createdAt: backendTestCase.createdAt,
    updatedAt: backendTestCase.updatedAt,
  };
}


export const testCaseService = {
  async fetchTestCases(featureId: number | string): Promise<TestCase[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/test-cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformTestCase);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching test cases:', error);
      throw error;
    }
  },

  async createTestCase(testCaseData: Omit<TestCase, 'id'>): Promise<TestCase> {
    try {
      // Use feature-specific route if featureId is provided
      const url = testCaseData.featureId 
        ? `${API_BASE_URL}/test-cases/features/${testCaseData.featureId}`
        : `${API_BASE_URL}/test-cases`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({
          ...testCaseData,
          featureId: testCaseData.featureId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create test case');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformTestCase(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error creating test case:', error);
      throw error;
    }
  },

  async updateTestCase(testCaseId: number, testCaseData: Partial<TestCase>): Promise<TestCase> {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update test case');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformTestCase(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error updating test case:', error);
      throw error;
    }
  },

  async deleteTestCase(testCaseId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete test case');
      }
    } catch (error: any) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  },

  async updateTestCaseStatus(testCaseId: number, status: "passed" | "failed"): Promise<TestCase> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ 
          status,
          actualResult: status === "passed" ? undefined : "Test failed - unexpected behavior"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update test case status');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return transformTestCase(result.data);
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error updating test case status:', error);
      throw error;
    }
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
          id: getId(tc._id || tc.id),
          title: tc.title || '',
          description: tc.description || undefined,
          priority: (tc.priority?.toLowerCase() || 'medium') as "high" | "medium" | "low",
          status: (tc.status?.toLowerCase() || 'pending') as "passed" | "failed" | "pending" | "in_progress" | "blocked",
          preconditions: tc.preconditions || '',
          steps: Array.isArray(tc.steps) ? tc.steps : [],
          expectedResult: tc.expectedResult || '',
          actualResult: tc.actualResult || '',
          bugReports: Array.isArray(tc.bugReports) ? tc.bugReports : [],
          featureId: typeof tc.featureId === 'object' 
            ? getId(tc.featureId._id || tc.featureId) || getId(featureId)
            : getId(tc.featureId || featureId),
          projectId: typeof tc.projectId === 'object'
            ? getId(tc.projectId._id || tc.projectId)
            : tc.projectId ? getId(tc.projectId) : undefined,
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

  // Check if feature has AI-generated test cases
  async hasAIGeneratedTestCases(featureId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/has-ai-test-cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to check AI-generated test cases');
      }

      const result = await response.json();
      
      if (result.success) {
        return result.hasAIGenerated || false;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error checking AI-generated test cases:', error);
      throw error;
    }
  },

  // Bulk create test cases
  async bulkCreateTestCases(featureId: string, testCases: Omit<TestCase, 'id'>[]): Promise<TestCase[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify({ featureId, testCases }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to bulk create test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformTestCase);
      }
      
      return [];
    } catch (error: any) {
      console.error('Error bulk creating test cases:', error);
      throw error;
    }
  },
};
