export interface Feature {
  _id: string; // MongoDB _id as string
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
  reasoning?: string;
  matchedSections?: string[];
  confidence?: number;
  relevanceScore?: number;
  rankingScore?: number;
  featureType?: "FUNCTIONAL" | "DATA" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
  metadata?: {
    featureType?: string;
    [key: string]: unknown;
  };
}
