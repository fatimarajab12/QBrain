import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 40, 
  showText = false,
  textSize = "md"
}) => {
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-lg transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Enhanced gradients with better color transitions */}
          <linearGradient id="hexTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="hexBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="eTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="eMiddle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="eBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          
          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Shadow effect */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0891b2" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Hexagon - top-left face with enhanced gradient */}
        <path
          d="M60 20 L95 35 L95 65 L60 80 L25 65 L25 35 Z"
          fill="url(#hexTop)"
          opacity="0.95"
          filter="url(#shadow)"
        />
        
        {/* Hexagon - bottom-right face with depth */}
        <path
          d="M60 20 L95 35 L95 65 L60 80 Z"
          fill="url(#hexBottom)"
          opacity="0.85"
        />

        {/* Enhanced inner "e" shape - top curved section */}
        <path
          d="M 45 50 Q 50 40, 60 40 Q 70 40, 75 45 Q 80 50, 75 55"
          stroke="url(#eTop)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Top face highlight with better visibility */}
        <path
          d="M 45 50 Q 50 40, 60 40 Q 70 40, 75 45"
          stroke="#22d3ee"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="1"
        />

        {/* Inner "e" shape - horizontal bar with glow */}
        <path
          d="M 75 50 L 85 50"
          stroke="url(#eMiddle)"
          strokeWidth="9"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        
        {/* Middle bar highlight */}
        <path
          d="M 75 48 L 85 48"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="1"
        />

        {/* Inner "e" shape - lower curve */}
        <path
          d="M 85 50 Q 90 55, 85 60 Q 80 65, 70 65 Q 60 65, 55 60"
          stroke="url(#eBottom)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        
        {/* Lower curve highlight */}
        <path
          d="M 85 50 Q 90 55, 85 60"
          stroke="#22d3ee"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Enhanced 3D depth lines */}
        <path
          d="M 60 20 L 95 35"
          stroke="#22d3ee"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M 95 35 L 95 65"
          stroke="#22d3ee"
          strokeWidth="1.5"
          opacity="0.5"
        />
        
        {/* Additional accent lines for depth */}
        <path
          d="M 40 50 L 100 50"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.2"
        />
      </svg>
      
      {showText && (
        <div className="flex flex-col gap-0.5">
          <span className={`font-extrabold bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-transparent bg-clip-text tracking-tight ${textSizeClasses[textSize]} leading-tight`}>
            QBrain
          </span>
          <span className="text-[10px] font-semibold text-cyan-500/80 tracking-wider uppercase">
            AI ASSISTANT
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
