// pages/feature-details/components/StatsGrid.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestCase } from "@/types/test-case";
import { calculateTestStats } from "@/utils/test-case-helpers";

interface StatsGridProps {
  testCases: TestCase[];
}

const StatsGrid = ({ testCases }: StatsGridProps) => {
  const { passedTests, failedTests, pendingTests } = calculateTestStats(testCases);

  const stats = [
    {
      title: "Total Tests",
      value: testCases.length,
      description: "All test cases"
    },
    {
      title: "Passed",
      value: passedTests,
      description: "Successful tests",
      className: "text-success"
    },
    {
      title: "Failed",
      value: failedTests,
      description: "Tests with issues",
      className: "text-destructive"
    },
    {
      title: "Pending",
      value: pendingTests,
      description: "Tests to be executed",
      className: "text-muted-foreground"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-soft border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.className || ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;