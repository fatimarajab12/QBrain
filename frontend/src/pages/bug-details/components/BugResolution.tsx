import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BugResolutionProps {
  resolution?: string;
}

export const BugResolution = ({ resolution }: BugResolutionProps) => {
  if (!resolution) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolution</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{resolution}</p>
      </CardContent>
    </Card>
  );
};

