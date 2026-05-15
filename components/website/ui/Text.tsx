// components/ui/Text.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("font-base-neue", {
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
    weight: {
      normal: "font-normal",
      bold: "font-bold",
    },
  },
  defaultVariants: { size: "md", color: "white", weight: "normal" },
});

interface TextProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: "p" | "span" | "label" | "strong" | "em";
}

export function Text({
  as: Tag = "p",
  size,
  color,
  weight,
  className,
  ...rest
}: TextProps) {
  return (
    <Tag
      className={cn(textVariants({ size, color, weight }), className)}
      {...rest}
    />
  );
}
