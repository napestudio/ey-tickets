"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type Levels = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
type Sizes = 16 | 20 | 24 | 32 | 40 | 48

const sizeByLevel: Record<Levels, Sizes> = {
  "h1": 48,
  "h2": 40,
  "h3": 32,
  "h4": 24,
  "h5": 20,
  "h6": 16,
}

const sizes: Record<Sizes, string> = {
  16: 'text-base',
  20: 'text-xl',
  24: 'text-2xl',
  32: 'text-3xl',
  40: 'text-4xl',
  48: 'text-5xl'
}

interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ as: Tag = "h2", className, ...rest }, ref) => {
    const Component = Tag as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(sizes[sizeByLevel[Tag]], className)}
        {...rest}
      />
    );
  }
);
Title.displayName = "Title";

export { Title };
export type { TitleProps };