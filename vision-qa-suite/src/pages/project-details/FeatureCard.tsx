// pages/project-details/FeatureCard.tsx
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Feature } from "@/types/feature";
import StatusDropdown from "./StatusDropdown";

interface FeatureCardProps {
  feature: Feature;
  projectId: string;
  onStatusChange: (featureId: number, newStatus: Feature["status"]) => void;
}

const FeatureCard = ({ feature, projectId, onStatusChange }: FeatureCardProps) => {
  return (
    <Card key={feature.id} className="shadow-soft border-border hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg line-clamp-1">{feature.name}</CardTitle>
          <StatusDropdown 
            feature={feature} 
            onStatusChange={onStatusChange}
          />
        </div>
        <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{feature.testCasesCount}</div>
            <div className="text-xs text-muted-foreground">Test Cases</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-destructive">{feature.bugsCount}</div>
            <div className="text-xs text-muted-foreground">Bugs</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{feature.progress}%</span>
          </div>
          <Progress value={feature.progress} />
        </div>
        <div className="flex gap-2">
          <Link to={`/projects/${projectId}/features/${feature.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Tests
            </Button>
          </Link>
          <Link to={`/test-generator?featureId=${feature.id}`} className="flex-1">
            <Button className="w-full gradient-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;