// services/test-case.service.ts
import { TestCase } from '@/types/test-case';

// Mock data - temporary until backend is ready
const mockTestCases: TestCase[] = [
  {
    id: 1,
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
  // TODO: Replace with real API when backend is ready
  async fetchTestCases(featureId: number): Promise<TestCase[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockTestCases.filter(tc => tc.featureId === featureId).length > 0 
      ? mockTestCases.filter(tc => tc.featureId === featureId)
      : mockTestCases.map(tc => ({ ...tc, featureId }));
  },

  // TODO: Replace with real API when backend is ready
  async createTestCase(testCaseData: Omit<TestCase, 'id'>): Promise<TestCase> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const testCaseToAdd: TestCase = {
      ...testCaseData,
      id: Math.max(...mockTestCases.map(tc => tc.id), 0) + 1
    };

    mockTestCases.push(testCaseToAdd);
    return testCaseToAdd;
  },

  // TODO: Replace with real API when backend is ready
  async updateTestCase(testCaseId: number, testCaseData: Partial<TestCase>): Promise<TestCase> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      mockTestCases[index] = { ...mockTestCases[index], ...testCaseData };
      return mockTestCases[index];
    }
    throw new Error('Test case not found');
  },

  // TODO: Replace with real API when backend is ready
  async deleteTestCase(testCaseId: number): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      mockTestCases.splice(index, 1);
    }
  },

  // TODO: Replace with real API when backend is ready
  async updateTestCaseStatus(testCaseId: number, status: "passed" | "failed"): Promise<TestCase> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = mockTestCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      mockTestCases[index] = {
        ...mockTestCases[index],
        status,
        actualResult: status === "passed" 
          ? mockTestCases[index].expectedResult 
          : "Test failed - unexpected behavior"
      };
      return mockTestCases[index];
    }
    throw new Error('Test case not found');
  }
};