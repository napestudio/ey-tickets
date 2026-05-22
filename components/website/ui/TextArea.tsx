"use client";
import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { textSizeTokens, colorTokens, weightTokens } from "@/components/website/ui/lib/design-system/tokens";

const textAreaVariants = cva("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", {
  variants: {
    size: textSizeTokens,
    color: colorTokens,
    border: {
      default: "border-input",
      error: "border-red-500",
    },
  },
  defaultVariants: { size: "sm", color: "black", border: "default" },
});

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color" | "size">,
    VariantProps<typeof textAreaVariants>{
    className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, color, border, ...rest }, ref) => {
    return (
      <textarea
        className={cn(textAreaVariants({ size, color, border }), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };