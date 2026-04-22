import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";

interface FeatureHeaderBackProps {
  projectId: string | undefined;
}

const FeatureHeaderBack = ({ projectId }: FeatureHeaderBackProps) => {
  const { navigateTo } = useNavigation();

  const handleBack = () => {
    if (projectId) {
      navigateTo(`/projects/${projectId}`, { prefetch: true });
    }
  };

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Features
      </Button>
    </div>
  );
};

export default FeatureHeaderBack;

