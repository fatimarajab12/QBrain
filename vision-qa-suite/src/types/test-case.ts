// types/test-case.ts
export interface TestCase {
  id: number;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "passed" | "failed" | "pending" | "in_progress" | "blocked";
  preconditions: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  bugReports: number[];
  featureId: number; 
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

