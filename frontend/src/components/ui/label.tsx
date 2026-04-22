import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants> & {
    required?: boolean;
  }
>(({ className, required, children, ...props }, ref) => {
  // Check if children contains * or if required prop is set
  const hasAsterisk = typeof children === 'string' && children.includes('*');
  const isRequired = required || hasAsterisk;
  
  // Extract text and asterisk - make asterisk red
  let labelContent = children;
  if (typeof children === 'string' && hasAsterisk) {
    // Split by * and add red asterisk
    const parts = children.split('*');
    if (parts.length === 2) {
      labelContent = (
        <>
          {parts[0]}
          <span className="text-destructive font-bold">*</span>
          {parts[1]}
        </>
      );
    } else {
      // Multiple asterisks or at the end
      labelContent = (
        <>
          {parts[0]}
          <span className="text-destructive font-bold">*</span>
          {parts.slice(1).join('*')}
        </>
      );
    }
  } else if (isRequired && !hasAsterisk) {
    // Add red asterisk if required prop is set but no asterisk in text
    labelContent = (
      <>
        {children}
        <span className="text-destructive font-bold ml-1">*</span>
      </>
    );
  }
  
  return (
    <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}>
      {labelContent}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
