"use client";
import * as React from "react"

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", {
  variants: {
    size: {
      xs: "text-sm",
      sm: "text-base",
      md: "text-xl",
      lg: "text-4xl",
      xl: "text-8xl",
    },
    color: {
      white: "text-white",
      muted: "text-white/60",
      accent: "text-brand-400",
    },
    border: {
      default: "border-input",
      error: "border-red-500",
    },
  },
  defaultVariants: { size: "md", color: "white", border: "default" },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color" | "size" | "border">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, color, border, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ size, color, border }),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
);

Input.displayName = "Input"

export { Input }
