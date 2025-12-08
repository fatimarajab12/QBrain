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
      <div className="flex flex-col gap-0.5">
        <span className={`font-extrabold bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 text-transparent bg-clip-text tracking-tight ${textSizeClasses[textSize]} leading-tight`}>
          QBrain
        </span>
        {showText && (
          <span className="text-[10px] font-semibold text-cyan-500/80 tracking-wider uppercase">
            AI ASSISTANT
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
