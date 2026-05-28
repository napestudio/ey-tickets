"use client";
import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { textSizeTokens } from "@/components/website/ui/lib/design-system/tokens";

const inputVariants = cva("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background", {
  variants: {
    size: textSizeTokens,
  },
  defaultVariants: { size: "sm" },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...rest }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size }),
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
