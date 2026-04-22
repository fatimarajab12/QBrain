import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "primary" | "muted" | "gradient";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  variant = "default"
}: LoadingSpinnerProps) => {
  const sizeValue = sizeClasses[size];
  
  if (variant === "gradient") {
    const sizeMap: Record<string, string> = {
      sm: "16",
      md: "24",
      lg: "32",
      xl: "48",
    };
    const svgSize = sizeMap[size] || "24";
    const strokeWidth = size === "xl" ? "4" : size === "lg" ? "3.5" : size === "md" ? "3" : "2.5";
    
    // Generate unique ID for each spinner to avoid conflicts
    const gradientId = `spinnerGradient-${size}-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
        {/* Outer glow effect */}
        <div 
          className="absolute rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-500/30 blur-lg animate-pulse"
          style={{ 
            width: `${parseInt(svgSize) * 1.8}px`, 
            height: `${parseInt(svgSize) * 1.8}px`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Main spinner with beautiful gradient */}
        <svg
          className="animate-spin relative z-10"
          width={svgSize}
          height={svgSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="60 15"
            className="opacity-20"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="30 45"
            className="opacity-80"
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(197, 100%, 55%)" stopOpacity="1" />
              <stop offset="30%" stopColor="hsl(217, 91%, 60%)" stopOpacity="1" />
              <stop offset="60%" stopColor="hsl(197, 100%, 55%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(197, 100%, 50%)" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Enhanced colors for non-gradient variants with glow effect
  const enhancedVariantClasses = {
    default: "text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]",
    primary: "text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]",
    muted: "text-muted-foreground",
  };

  return (
    <Loader2 
      className={cn(
        "animate-spin",
        sizeValue,
        enhancedVariantClasses[variant as keyof typeof enhancedVariantClasses],
        className
      )} 
    />
  );
};

