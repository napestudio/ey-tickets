"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import {
  textSizeTokens,
  colorTokens,
  weightTokens,
} from "@/components/website/ui/lib/design-system/tokens";

const paragraphVariants = cva("font-base-neue", {
  variants: {
    size:   textSizeTokens,  // xs | sm | md
    color:  colorTokens,
    weight: weightTokens,
  },
  defaultVariants: { size: "sm", color: "black", weight: "normal" },
});

interface ParagraphProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">,
    VariantProps<typeof paragraphVariants> {
  className?: string;
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ size, color, weight, className, ...rest }, ref) => (
    <p
      ref={ref}
      className={cn(paragraphVariants({ size, color, weight }), className)}
      {...rest}
    />
  )
);
Paragraph.displayName = "Paragraph";

export { Paragraph };
export type { ParagraphProps };
