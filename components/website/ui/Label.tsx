"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50");

interface LabelProps
  extends
    Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "color">,
    VariantProps<typeof labelVariants> {
  className?: string;
}

function Label({ className, ...rest }: LabelProps) {
  return (
    <label      
      className={cn(labelVariants(), className)}
      {...rest}
    />
  );
}

export { Label };
export type { LabelProps };