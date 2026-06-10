"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import {
  textSizeTokens,
} from "@/components/website/ui/lib/design-system/tokens";

const paragraphVariants = cva("font-nebulica", {
  variants: {
    size:   textSizeTokens,  // xs | sm | md
  },
  defaultVariants: { size: "sm" },
});

interface ParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphVariants> {
  className?: string;
}

const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ size, className, ...rest }, ref) => (
    <p
      ref={ref}
      className={cn(paragraphVariants({ size }), className)}
      {...rest}
    />
  )
);
Paragraph.displayName = "Paragraph";

export { Paragraph };
export type { ParagraphProps };
