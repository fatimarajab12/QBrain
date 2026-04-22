import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "@/types/bug";

interface BugStepsToReproduceProps {
  steps: string[];
}

export const BugStepsToReproduce = ({ steps }: BugStepsToReproduceProps) => {
  if (!steps || steps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Steps to Reproduce</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="text-muted-foreground">
              {step}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

