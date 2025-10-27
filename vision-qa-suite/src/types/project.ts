export interface Project {
  id: number;
  name: string;
  description: string;
  featuresCount: number;
  testCasesCount: number;
  bugsCount: number;
  progress: number;
  lastUpdated: string; // أو lastUpdatedAt?: string;
}
