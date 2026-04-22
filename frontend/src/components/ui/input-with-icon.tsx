import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface InputWithIconProps extends React.ComponentProps<"input"> {
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  rightIconButton?: boolean;
  iconSize?: "sm" | "md" | "lg";
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ 
    className, 
    leftIcon: LeftIcon, 
    rightIcon: RightIcon, 
    onRightIconClick, 
    rightIconButton = false,
    iconSize = "md",
    disabled,
    ...props 
  }, ref) => {
    const iconSizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    };

    const iconSizeClass = iconSizeClasses[iconSize];

    return (
      <div className="group w-full">
        <div className="flex items-center w-full relative">
          {/* Left Icon - Always decorative, never interactive */}
          {LeftIcon && (
            <div 
              className="flex items-center justify-center pl-3 pointer-events-none select-none"
              aria-hidden="true"
            >
              <LeftIcon 
                className={cn(
                  iconSizeClass,
                  "text-muted-foreground transition-colors duration-200",
                  "group-focus-within:text-cyan-500",
                  disabled && "opacity-50"
                )} 
              />
            </div>
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Remove left padding if left icon exists (handled by flex container)
              LeftIcon && "pl-0",
              // Remove right padding if right icon button exists (handled by flex container)
              RightIcon && rightIconButton && "pr-0",
              // Keep right padding if right icon is decorative
              RightIcon && !rightIconButton && "pr-12",
              "flex-1",
              className
            )}
            {...props}
          />
          
          {/* Right Icon - Interactive button */}
          {RightIcon && rightIconButton && (
            <button
              type="button"
              onClick={onRightIconClick}
              disabled={disabled}
              className={cn(
                "flex items-center justify-center",
                "text-muted-foreground hover:text-cyan-500",
                "transition-all duration-200",
                "p-1.5 rounded-md mr-2",
                "hover:bg-cyan-50 dark:hover:bg-cyan-950/20",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-1",
                "active:scale-95",
                disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground hover:bg-transparent"
              )}
              tabIndex={disabled ? -1 : 0}
              aria-label={props.type === "password" 
                ? (props.value && String(props.value).length > 0 ? "Hide password" : "Show password")
                : "Toggle visibility"
              }
            >
              <RightIcon className={iconSizeClass} />
            </button>
          )}
        </div>

        {/* Right Icon - Decorative only (not a button) */}
        {RightIcon && !rightIconButton && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 z-[1] pointer-events-none select-none"
            aria-hidden="true"
          >
            <RightIcon 
              className={cn(
                iconSizeClass,
                "text-muted-foreground transition-colors duration-200",
                "group-focus-within:text-cyan-500",
                disabled && "opacity-50"
              )} 
            />
          </div>
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
