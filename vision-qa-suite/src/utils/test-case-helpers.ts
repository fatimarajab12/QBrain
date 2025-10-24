// utils/test-case-helpers.ts
import { TestCase } from '@/types/test-case';

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-destructive/10 text-destructive";
    case "medium": return "bg-accent/10 text-accent";
    case "low": return "bg-success/10 text-success";
    default: return "";
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "passed": return "bg-success/10 text-success";
    case "failed": return "bg-destructive/10 text-destructive";
    case "pending": return "bg-muted text-muted-foreground";
    default: return "";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "passed": return "CheckCircle2";
    case "failed": return "AlertCircle";
    case "pending": return "Play";
    default: return null;
  }
};

export const calculateTestStats = (testCases: TestCase[]) => {
  const passedTests = testCases.filter(tc => tc.status === "passed").length;
  const failedTests = testCases.filter(tc => tc.status === "failed").length;
  const pendingTests = testCases.filter(tc => tc.status === "pending").length;
  
  return { passedTests, failedTests, pendingTests };
};

// New test case template
export const newTestCaseTemplate: Omit<TestCase, 'id'> = {
  title: "",
  priority: "medium",
  status: "pending",
  preconditions: "",
  steps: [],
  expectedResult: "",
  actualResult: "",
  bugReports: []
};