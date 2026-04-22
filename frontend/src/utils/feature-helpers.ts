import { Feature } from '@/types/feature';

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": 
      return "bg-success/15 text-success border-success/30";
    case "in-progress": 
      return "bg-accent/15 text-accent border-accent/30";
    case "pending": 
      return "bg-orange-500/15 text-orange-500 border-orange-500/30";
    default: 
      return "bg-muted/50 text-muted-foreground border-muted";
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed": return "Completed";
    case "in-progress": return "In Progress";
    case "pending": return "Pending";
    default: return status;
  }
};

export const calculateProjectProgress = (features: Feature[]): number => {
  if (features.length === 0) return 0;
  const totalProgress = features.reduce((sum, feature) => sum + feature.progress, 0);
  return Math.round(totalProgress / features.length);
};

export const getFeatureStats = (features: Feature[]) => {
  const totalTestCases = features.reduce((acc, f) => acc + f.testCasesCount, 0);
  const totalBugs = features.reduce((acc, f) => acc + f.bugsCount, 0);
  const completedFeatures = features.filter(f => f.status === "completed").length;
  
  return {
    totalTestCases,
    totalBugs,
    completedFeatures,
    totalFeatures: features.length
  };
};
