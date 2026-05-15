import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textAreaVariants = cva("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    color: {
      default: "text-white",
      white: "text-white",
      muted: "text-white/60",
      accent: "text-brand-400",
    },
    border: {
      default: "border-input",
      error: "border-red-500",
    },
  },
  defaultVariants: { size: "default", color: "default", border: "default" },
});

export interface TextareaProps extends VariantProps<typeof textAreaVariants> {
    className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, color, border, ...props }, ref) => {
    return (
      <textarea
        className={cn(textAreaVariants({ size, color, border }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
