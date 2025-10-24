// pages/dashboard/components/StatsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/project";

interface StatsGridProps {
  projects: Project[];
}

const StatsGrid = ({ projects }: StatsGridProps) => {
  const totalFeatures = projects.reduce((acc, p) => acc + p.featuresCount, 0);
  const totalTestCases = projects.reduce((acc, p) => acc + p.testCasesCount, 0);
  const totalBugs = projects.reduce((acc, p) => acc + p.bugsCount, 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      description: "Active testing projects"
    },
    {
      title: "Total Features",
      value: totalFeatures,
      description: "Across all projects"
    },
    {
      title: "Test Cases",
      value: totalTestCases,
      description: "Created test cases"
    },
    {
      title: "Average Progress",
      value: `${avgProgress}%`,
      description: "Overall completion"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-soft border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;