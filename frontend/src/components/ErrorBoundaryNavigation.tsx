import { Button } from '@/components/ui/button';

interface ErrorBoundaryNavigationProps {
  onReset: () => void;
}

export const ErrorBoundaryNavigation = ({ onReset }: ErrorBoundaryNavigationProps) => {
  const handleGoHome = () => {
    onReset();
    window.location.href = '/';
  };

  const handleReload = () => {
    onReset();
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleGoHome} className="flex-1">
        Go to Home
      </Button>
      <Button 
        variant="outline" 
        onClick={handleReload}
        className="flex-1"
      >
        Reload Page
      </Button>
    </div>
  );
};

