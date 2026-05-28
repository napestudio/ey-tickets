"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Title } from "./Title";
import { RichText } from "./RichText";

import type { TextColor } from "@/components/website/ui/lib/design-system/types";

// ─── Card ─────────────────────────────────────────────────────────────────────

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground", className)}
    {...rest}
  />
));
Card.displayName = "Card";

// ─── CardHeader ───────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...rest}
  />
));
CardHeader.displayName = "CardHeader";

// ─── CardTitle ────────────────────────────────────────────────────────────────

interface CardTitleProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
  color?: TextColor;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, color = "black", ...rest }, ref) => (
    <Title
      ref={ref}
      as="h3"
      className={cn("tracking-tight", className)}
      {...rest}
    />
  )
);
CardTitle.displayName = "CardTitle";

// ─── CardDescription ─────────────────────────────────────────────────────────

interface CardDescriptionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  color?: TextColor;
}

const CardDescription = React.forwardRef<HTMLElement, CardDescriptionProps>(
  ({ className, color = "muted", ...rest }, ref) => (
    <RichText
      ref={ref}
      as="p"
      size="sm"
      color={color}
      className={cn("max-w-prose", className)}
      {...rest}
    />
  )
);
CardDescription.displayName = "CardDescription";

// ─── CardContent ──────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />
));
CardContent.displayName = "CardContent";

// ─── CardFooter ───────────────────────────────────────────────────────────────

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...rest}
  />
));
CardFooter.displayName = "CardFooter";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

export type { CardTitleProps, CardDescriptionProps };