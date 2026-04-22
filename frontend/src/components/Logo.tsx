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
    <div className={`flex items-center gap-2 ${className} group/logo`}>
      <div className="flex flex-col gap-1.5 relative">
        {/* QBrain with white color and theme-based effects */}
        <span 
          className={`
            font-extrabold text-white tracking-tight ${textSizeClasses[textSize]} leading-tight
            drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]
            drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]
            drop-shadow-[0_4px_12px_rgba(59,130,246,0.3)]
            relative z-10
            group-hover/logo:drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]
            group-hover/logo:drop-shadow-[0_4px_16px_rgba(6,182,212,0.7)]
            group-hover/logo:drop-shadow-[0_6px_20px_rgba(59,130,246,0.5)]
            group-hover/logo:drop-shadow-[0_8px_24px_rgba(99,102,241,0.4)]
            transition-all duration-500
            group-hover/logo:scale-105
          `}
        >
          {/* Theme-based gradient overlay on hover - using exact theme colors */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-indigo-500/25 opacity-0 group-hover/logo:opacity-100 blur-xl transition-opacity duration-500 -z-10"></span>
          
          {/* Theme-based glow effect with pulse */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 opacity-0 group-hover/logo:opacity-100 blur-2xl transition-opacity duration-500 -z-10 animate-pulse-slow"></span>
          
          {/* Subtle theme glow that's always visible */}
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-blue-500/8 to-indigo-500/8 blur-lg -z-10"></span>
          
          QBrain
        </span>
        
        {/* AI ASSISTANT with white color and theme-based effects */}
        {showText && (
          <div className="relative">
            <span 
              className="
                text-xs font-bold text-white/95 tracking-wider uppercase
                drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]
                drop-shadow-[0_1px_4px_rgba(6,182,212,0.4)]
                drop-shadow-[0_2px_6px_rgba(59,130,246,0.3)]
                relative z-10
                group-hover/logo:text-white
                group-hover/logo:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]
                group-hover/logo:drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]
                group-hover/logo:drop-shadow-[0_3px_10px_rgba(59,130,246,0.5)]
                transition-all duration-500
                inline-block
              "
            >
              {/* Theme-based shimmer effect */}
              <span className="absolute inset-0 -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/20 via-blue-400/20 to-transparent skew-x-12"></span>
              
              {/* Theme-based glow background */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/12 via-blue-500/12 to-indigo-500/12 opacity-0 group-hover/logo:opacity-100 blur-md transition-opacity duration-500 -z-10 rounded"></span>
              
              {/* Subtle theme glow always visible */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/6 via-blue-500/6 to-indigo-500/6 blur-sm -z-10 rounded"></span>
              
              <span className="relative z-10">AI ASSISTANT</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
