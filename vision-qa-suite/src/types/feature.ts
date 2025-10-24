// types/feature.ts
export interface Feature {
  id: number;
  name: string;
  description: string;
  testCasesCount: number;
  bugsCount: number;
  status: "completed" | "in-progress" | "pending";
  progress: number;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}