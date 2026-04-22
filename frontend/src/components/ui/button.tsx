import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-[hsl(var(--primary-hover))] hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] [&_svg]:hover:scale-110",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-[hsl(var(--destructive-hover))] hover:shadow-xl hover:shadow-destructive/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] [&_svg]:hover:scale-110",
        outline: "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] [&_svg]:hover:scale-110",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-[hsl(var(--secondary-hover))] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] [&_svg]:hover:scale-110",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-md active:bg-accent/80 [&_svg]:hover:scale-110",
        link: "text-primary underline-offset-4 hover:underline hover:text-[hsl(var(--primary-hover))] transition-colors [&_svg]:hover:scale-110",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-lg px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
