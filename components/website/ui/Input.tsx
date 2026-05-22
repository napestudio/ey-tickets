"use client";
import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { textSizeTokens, colorTokens } from "@/components/website/ui/lib/design-system/tokens";

const inputVariants = cva("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", {
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color" | "size" | "border">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, color, border, ...rest }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size, color, border }),
          className
        )}
        ref={ref}
        {...rest}
      />
    )
  }
);

Input.displayName = "Input"

export { Input }
