import { LoadingSpinner } from "./loading-spinner";

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const PageLoading = ({ 
  message = "Loading...", 
  fullScreen = false 
}: PageLoadingProps) => {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20" 
    : "p-8 flex flex-col items-center justify-center min-h-64 gap-4";

  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center">
        {/* Main spinner with gradient */}
        <LoadingSpinner size="xl" variant="gradient" />
        {/* Animated circles with beautiful colors */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="rounded-full border-4 border-cyan-500/20 animate-ping" 
            style={{ 
              width: '120%', 
              height: '120%',
            }} 
          />
          <div 
            className="absolute rounded-full border-2 border-blue-500/15 animate-ping" 
            style={{ 
              width: '150%', 
              height: '150%', 
              animationDelay: '0.7s',
            }} 
          />
        </div>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground mt-6 animate-pulse font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

