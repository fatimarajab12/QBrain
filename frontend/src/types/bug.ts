// types/bug.ts
export interface Bug {
  id: string; // MongoDB _id as string
  _id?: string; // Keep for backend compatibility
  title: string;
  description?: string;
  featureId: string; // MongoDB ObjectId as string
  feature_id?: string; // Keep for backward compatibility
  projectId: string; // MongoDB ObjectId as string
  project_id?: string; // Keep for backward compatibility
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedBy?: string; // User ID
  assignedTo?: string | null; // User ID
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  environment?: string;
  attachments?: string[];
  resolution?: string;
  resolvedAt?: string | Date;
  closedAt?: string | Date;
  createdAt?: string | Date;
  created_at?: string | Date; // Keep for backward compatibility
  updatedAt?: string | Date;
  updated_at?: string | Date; // Keep for backward compatibility
  // Populated fields
  feature?: {
    _id: string;
    name: string;
    description?: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  reportedByUser?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedToUser?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}