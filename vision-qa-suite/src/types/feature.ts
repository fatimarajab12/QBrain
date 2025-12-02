export interface Feature {
  id: string; // MongoDB _id as string
  _id?: string; // Keep for backend compatibility
  name: string;
  description: string;
  testCasesCount?: number; // Virtual field from backend
  bugsCount?: number; // Calculated on frontend
  status: "completed" | "in-progress" | "pending" | "blocked";
  progress?: number; // Calculated on frontend
  projectId: string; // MongoDB ObjectId as string
  priority?: "High" | "Medium" | "Low";
  createdAt?: string;
  updatedAt?: string;
  isAIGenerated?: boolean;
  acceptanceCriteria?: string[];
}
