import { TestCase } from '@/types/test-case';
import { logger } from '@/utils/logger';
import { authStorage } from '@/utils/auth-helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface BackendTestCase {
  _id?: string | { toString: () => string };
  id?: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  preconditions?: string[] | string;
  steps?: string[];
  expectedResult?: string;
  actualResult?: string;
  bugReports?: unknown[];
  featureId?: string | { _id?: string };
  projectId?: string | { _id?: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isAIGenerated?: boolean;
  testData?: Map<string, unknown> | Record<string, unknown>;
  metadata?: Map<string, unknown> | Record<string, unknown>;
  gherkin?: string;
}

function getId(id: unknown): number {
  if (!id) return 0;
  const idStr = typeof id === 'object' && id !== null && ('_id' in id || 'id' in id)
    ? String((id as { _id?: unknown; id?: unknown })._id || (id as { _id?: unknown; id?: unknown }).id || '')
    : String(id);
  if (!idStr) return 0;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    const char = idStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function transformTestCase(backendTestCase: BackendTestCase): TestCase {
  let preconditions: string[] = [];
  if (Array.isArray(backendTestCase.preconditions)) {
    preconditions = backendTestCase.preconditions.map((p) => String(p));
  } else if (backendTestCase.preconditions) {
    preconditions = [String(backendTestCase.preconditions)];
  }

  let testData: Record<string, unknown> = {};
  if (backendTestCase.testData) {
    if (backendTestCase.testData instanceof Map) {
      testData = Object.fromEntries(backendTestCase.testData);
    } else if (typeof backendTestCase.testData === 'object') {
      testData = backendTestCase.testData as Record<string, unknown>;
    }
  }

  let metadata: Record<string, unknown> = {};
  if (backendTestCase.metadata) {
    if (backendTestCase.metadata instanceof Map) {
      metadata = Object.fromEntries(backendTestCase.metadata);
    } else if (typeof backendTestCase.metadata === 'object') {
      metadata = backendTestCase.metadata as Record<string, unknown>;
    }
  }

  return {
    _id: String(backendTestCase._id || backendTestCase.id || ''),
    title: backendTestCase.title || '',
    description: backendTestCase.description || undefined,
    priority: (backendTestCase.priority?.toLowerCase() || 'medium') as "high" | "medium" | "low",
    status: (backendTestCase.status?.toLowerCase() || 'pending') as "passed" | "failed" | "pending" | "in_progress" | "blocked",
    preconditions: preconditions,
    steps: Array.isArray(backendTestCase.steps) ? backendTestCase.steps.map((s) => String(s)) : [],
    expectedResult: backendTestCase.expectedResult || '',
    actualResult: backendTestCase.actualResult || undefined,
    bugReports: Array.isArray(backendTestCase.bugReports) 
      ? backendTestCase.bugReports.map((id) => String(id))
      : [],
    featureId: typeof backendTestCase.featureId === 'object' 
      ? String(backendTestCase.featureId._id || backendTestCase.featureId || '')
      : String(backendTestCase.featureId || ''),
    projectId: typeof backendTestCase.projectId === 'object'
      ? String(backendTestCase.projectId._id || backendTestCase.projectId || '')
      : backendTestCase.projectId ? String(backendTestCase.projectId) : undefined,
    createdAt: backendTestCase.createdAt instanceof Date 
      ? backendTestCase.createdAt.toISOString() 
      : (backendTestCase.createdAt || new Date().toISOString()),
    updatedAt: backendTestCase.updatedAt instanceof Date 
      ? backendTestCase.updatedAt.toISOString() 
      : (backendTestCase.updatedAt || new Date().toISOString()),
    isAIGenerated: backendTestCase.isAIGenerated || false,
    testData: testData,
    metadata: metadata,
    gherkin: backendTestCase.gherkin || undefined,
  };
}


export const testCaseService = {
  async fetchTestCases(featureId: number | string): Promise<TestCase[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/test-cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
    } catch (error) {
      logger.error('Error fetching test cases', error);
      throw error;
    }
  },

  async fetchProjectTestCases(projectId: string, filters?: {
    status?: string;
    priority?: string;
    featureId?: string;
  }): Promise<TestCase[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      if (filters?.featureId) queryParams.append('featureId', filters.featureId);
      
      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/test-cases/projects/${projectId}/test-cases${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch project test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformTestCase);
      }
      
      return [];
    } catch (error) {
      logger.error('Error fetching project test cases', error);
      throw error;
    }
  },

  async createTestCase(testCaseData: Omit<TestCase, '_id'>): Promise<TestCase> {
    try {
      const url = testCaseData.featureId 
        ? `${API_BASE_URL}/test-cases/features/${testCaseData.featureId}`
        : `${API_BASE_URL}/test-cases`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
    } catch (error) {
      logger.error('Error creating test case', error);
      throw error;
    }
  },

  async updateTestCase(testCaseId: string, testCaseData: Partial<TestCase>): Promise<TestCase> {
    try {
      const { _id, createdAt, updatedAt, bugReports, ...updateData } = testCaseData;
      
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
        body: JSON.stringify(updateData),
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
    } catch (error) {
      logger.error('Error updating test case', error);
      throw error;
    }
  },

  async deleteTestCase(testCaseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete test case');
      }
    } catch (error) {
      logger.error('Error deleting test case', error);
      throw error;
    }
  },

  async updateTestCaseStatus(testCaseId: string, status: "passed" | "failed"): Promise<TestCase> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
    } catch (error) {
      logger.error('Error updating test case status', error);
      throw error;
    }
  },

  async generateAITestCases(featureId: string, options?: Record<string, unknown>): Promise<TestCase[]> {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const requestOptions = {
        ...(options || {}),
        featureType: options?.featureType,
        matchedSections: options?.matchedSections,
        useComprehensiveRetrieval: options?.useComprehensiveRetrieval !== false,
      };

      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/generate-test-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
        body: JSON.stringify({ options: requestOptions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate test cases');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        return result.data.map(transformTestCase);
      }
      
      return [];
    } catch (error) {
      logger.error('Error generating test cases', error);
      throw error;
    }
  },

  async hasAIGeneratedTestCases(featureId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/features/${featureId}/has-ai-test-cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
    } catch (error) {
      logger.error('Error checking AI-generated test cases', error);
      throw error;
    }
  },

  async bulkCreateTestCases(featureId: string, testCases: Omit<TestCase, '_id'>[]): Promise<TestCase[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
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
    } catch (error) {
      logger.error('Error bulk creating test cases', error);
      throw error;
    }
  },

  async convertToGherkin(testCaseId: string): Promise<{ gherkin: string; testCaseId: string; testCaseTitle: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}/gherkin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to convert test case to Gherkin');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      logger.error('Error converting to Gherkin', error);
      throw error;
    }
  },

  async convertFeatureTestCasesToGherkin(featureId: string, featureName?: string): Promise<{ gherkin: string; featureId: string; testCasesCount: number }> {
    try {
      const url = new URL(`${API_BASE_URL}/test-cases/features/${featureId}/gherkin`);
      if (featureName) {
        url.searchParams.append('featureName', featureName);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to convert test cases to Gherkin');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      logger.error('Error converting feature test cases to Gherkin', error);
      throw error;
    }
  },

  async exportToExcel(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/test-cases/projects/${projectId}/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStorage.getToken() || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export test cases to Excel');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `QBrain_TestCases_${projectId}.xlsx`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error('Error exporting to Excel', error);
      throw error;
    }
  },
};
