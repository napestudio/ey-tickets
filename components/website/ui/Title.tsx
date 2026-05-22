"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { titleSizeTokens, colorTokens, weightTokens } from "@/components/website/ui/lib/design-system/tokens";

const textVariants = cva("font-base-neue", {
  variants: {
    size:   titleSizeTokens,  // xs | sm | md | lg | xl
    color:  colorTokens,
    weight: weightTokens,
  },
  defaultVariants: { size: "lg", color: "black", weight: "normal" },
});

interface TitleProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ as: Tag = "h2", size, color, weight, className, ...rest }, ref) => {
    const Component = Tag as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ size, color, weight }), className)}
        {...rest}
      />
    );
  }
);
Title.displayName = "Title";

export { Title };
export type { TitleProps };