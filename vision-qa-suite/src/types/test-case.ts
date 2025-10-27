// types/test-case.ts
export interface TestCase {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  status: "passed" | "failed" | "pending";
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

