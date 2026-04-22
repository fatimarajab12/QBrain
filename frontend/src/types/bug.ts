// types/bug.ts
export interface Bug {
  _id: string; // MongoDB _id as string
  title: string;
  description?: string;
  featureId: string; // MongoDB ObjectId as string
  feature_id?: string; // Keep for backward compatibility
  projectId: string; // MongoDB ObjectId as string
  project_id?: string; // Keep for backward compatibility
  severity: "Low" | "Medium" | "High" | "Critical";
  priority: "P0" | "P1" | "P2" | "P3";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedBy?: string; // User ID
  assignedTo?: string | null; // User ID
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  reproducibility: "Always" | "Often" | "Sometimes" | "Rare" | "Unable";
  environment?: {
    os?: string;
    browser?: string;
    browserVersion?: string;
    appType?: "Web" | "Mobile" | "API";
    appVersion?: string;
    build?: string;
  };
  component?: string;
  labels?: string[];
  affectedUrl?: string;
  attachments?: string[];
  attachmentDetails?: Array<{
    filename: string;
    originalname: string;
    path: string;
    size: number;
    mimetype: string;
  }>;
  firstOccurrenceDate?: string | Date;
  lastOccurrenceDate?: string | Date;
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