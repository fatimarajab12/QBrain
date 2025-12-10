// types/test-case.ts
export interface TestCase {
  id: string; // MongoDB ObjectId as string
  _id?: string; // Keep for backend compatibility
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "passed" | "failed" | "pending" | "in_progress" | "blocked";
  preconditions: string[]; // Array of strings (matching backend)
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  bugReports: string[]; // Array of bug IDs (strings)
  featureId: string; // MongoDB ObjectId as string
  projectId?: string; // MongoDB ObjectId as string
  createdAt?: string;
  updatedAt?: string;
  isAIGenerated?: boolean;
  testData?: Record<string, any>;
  metadata?: Record<string, any>;
  gherkin?: string; // Auto-generated Gherkin format
}

