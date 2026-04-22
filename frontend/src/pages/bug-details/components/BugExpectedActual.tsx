import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "@/types/bug";

interface BugExpectedActualProps {
  expectedBehavior?: string;
  actualBehavior?: string;
}

export const BugExpectedActual = ({ expectedBehavior, actualBehavior }: BugExpectedActualProps) => {
  if (!expectedBehavior && !actualBehavior) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected vs Actual Behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expectedBehavior && (
          <div>
            <h4 className="font-semibold text-green-700 mb-2">Expected Result</h4>
            <p className="text-muted-foreground">{expectedBehavior}</p>
          </div>
        )}

        {actualBehavior && (
          <div>
            <h4 className="font-semibold text-red-700 mb-2">Actual Result</h4>
            <p className="text-muted-foreground">{actualBehavior}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

