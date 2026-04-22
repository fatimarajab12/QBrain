import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BugLabelsProps {
  labels: string[];
}

export const BugLabels = ({ labels }: BugLabelsProps) => {
  if (!labels || labels.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {labels.map((label, index) => (
            <Badge key={index} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

