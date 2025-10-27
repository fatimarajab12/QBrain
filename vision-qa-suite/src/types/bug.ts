// types/bug.ts
export interface Bug {
  id: number;
  title: string;
  description: string;
  feature_id: number;
  project_id: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created_at: string;
  updated_at: string;
}