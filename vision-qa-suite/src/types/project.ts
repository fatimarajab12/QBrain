export interface Project {
  id: string; // MongoDB _id as string
  _id?: string; // Keep for backend compatibility
  name: string;
  description: string;
  status?: "active" | "archived" | "completed";
  userId?: string;
  featuresCount?: number; // Calculated on frontend
  testCasesCount?: number; // Calculated on frontend
  bugsCount?: number; // Calculated on frontend
  progress?: number; // Calculated on frontend
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  srsDocument?: {
    fileName?: string;
    filePath?: string;
    uploadedAt?: string;
    processed?: boolean;
    chunksCount?: number;
  };
  hasSRS?: boolean; // Helper for frontend
  srsFileName?: string; // Helper for frontend
}
