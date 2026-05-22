"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/website/ui/Button";
import { RichText } from "@/components/website/ui/Text";
import { Title } from "../ui/Title";

import type { TextColor, HeroBackground, ButtonVariant } from "@/components/website/ui/lib/design-system/types";

// ─── Context ──────────────────────────────────────────────────────────────────

interface HeroContextValue {
  background: HeroBackground;
}

const HeroContext = React.createContext<HeroContextValue>({ background: "none" });
const useHeroContext = () => React.useContext(HeroContext);

// ─── Mapas de variantes ───────────────────────────────────────────────────────

const textMap: Record<
  HeroBackground,
  { title: TextColor; description: TextColor; eyebrow: TextColor }
> = {
  none:    { title: "black",  description: "black",  eyebrow: "black"  },
  muted:   { title: "black",  description: "black",  eyebrow: "black"  },
  primary: { title: "white",  description: "muted",  eyebrow: "accent" },
  dark:    { title: "white",  description: "muted",  eyebrow: "accent" },
};

const buttonMap: Record<
  HeroBackground,
  { primary: ButtonVariant; secondary: ButtonVariant }
> = {
  none:    { primary: "primary", secondary: "outline"   },
  muted:   { primary: "primary", secondary: "outline"   },
  primary: { primary: "primary", secondary: "secondary" },
  dark:    { primary: "primary", secondary: "secondary" },
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const heroVariants = cva("relative w-full flex", {
  variants: {
    layout: {
      centered:          "flex-col items-center text-center py-24 px-6",
      split:             "flex-row items-center gap-12 py-24 px-6 max-w-6xl mx-auto",
      "split-reverse":   "flex-row-reverse items-center gap-12 py-24 px-6 max-w-6xl mx-auto",
      fullscreen:        "flex-col items-center justify-center text-center min-h-svh px-6",
    },
    background: {
      none:    "",
      muted:   "bg-muted text-black",
      primary: "bg-primary text-primary-foreground",
      dark:    "bg-gray-950 text-white",
    },
  },
  defaultVariants: { layout: "centered", background: "none" },
});

interface HeroRootProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof heroVariants> {}

const HeroSection = React.forwardRef<HTMLDivElement, HeroRootProps>(
  ({ className, layout, background = "none", children, ...props }, ref) => (
    <HeroContext.Provider value={{ background: background as HeroBackground }}>
      <div
        ref={ref}
        className={cn(heroVariants({ layout, background }), className)}
        {...props}
      >
        {children}
      </div>
    </HeroContext.Provider>
  )
);
HeroSection.displayName = "HeroSection";

// ─── Content ──────────────────────────────────────────────────────────────────

const HeroContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-4 flex-1 min-w-0", className)}
    {...props}
  />
));
HeroContent.displayName = "HeroContent";

// ─── Media ────────────────────────────────────────────────────────────────────

const HeroMedia = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 min-w-0 flex items-center justify-center", className)}
    {...props}
  />
));
HeroMedia.displayName = "HeroMedia";

// ─── Badge ────────────────────────────────────────────────────────────────────

const HeroBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
      className
    )}
    {...props}
  />
));
HeroBadge.displayName = "HeroBadge";

// ─── Eyebrow ──────────────────────────────────────────────────────────────────

interface HeroEyebrowProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  color?: TextColor;
}

const HeroEyebrow = React.forwardRef<HTMLElement, HeroEyebrowProps>(
  ({ className, color, ...props }, ref) => {
    const { background } = useHeroContext();
    return (
      <RichText
        ref={ref}
        as="p"
        size="xs"
        weight="bold"
        color={color ?? textMap[background].eyebrow}
        className={cn("uppercase tracking-widest", className)}
        {...props}
      />
    );
  }
);
HeroEyebrow.displayName = "HeroEyebrow";

// ─── Title ────────────────────────────────────────────────────────────────────

interface HeroTitleProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  color?: TextColor;
}

const HeroTitle = React.forwardRef<HTMLHeadingElement, HeroTitleProps>(
  ({ className, color, ...props }, ref) => {
    const { background } = useHeroContext();
    return (
      <Title
        ref={ref}
        as="h1"
        size="xl"
        weight="bold"
        color={color ?? textMap[background].title}
        className={cn("tracking-tight", className)}
        role="heading"
        aria-level={1}
        {...props}
      />
    );
  }
);
HeroTitle.displayName = "HeroTitle";

// ─── SubTitle ─────────────────────────────────────────────────────────────────

const HeroSubTitle = React.forwardRef<HTMLHeadingElement, HeroTitleProps>(
  ({ className, color, ...props }, ref) => {
    const { background } = useHeroContext();
    return (
      <Title
        ref={ref}
        as="h2"
        size="lg"
        weight="bold"
        color={color ?? textMap[background].title}
        className={cn("tracking-tight", className)}
        role="heading"
        aria-level={2}
        {...props}
      />
    );
  }
);
HeroSubTitle.displayName = "HeroSubTitle";

// ─── Description ─────────────────────────────────────────────────────────────

interface HeroDescriptionProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  color?: TextColor;
}

const HeroDescription = React.forwardRef<HTMLElement, HeroDescriptionProps>(
  ({ className, color, ...props }, ref) => {
    const { background } = useHeroContext();
    return (
      <RichText
        ref={ref}
        as="p"
        size="sm"
        color={color ?? textMap[background].description}
        className={cn("max-w-prose", className)}
        {...props}
      />
    );
  }
);
HeroDescription.displayName = "HeroDescription";

// ─── Actions ──────────────────────────────────────────────────────────────────

interface HeroActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  primaryLabel?:     string;
  primaryHref?:      string;
  primaryOnClick?:   () => void;
  secondaryLabel?:   string;
  secondaryHref?:    string;
  secondaryOnClick?: () => void;
}

const HeroActions = React.forwardRef<HTMLDivElement, HeroActionsProps>(
  (
    {
      className,
      primaryLabel,
      primaryHref,
      primaryOnClick,
      secondaryLabel,
      secondaryHref,
      secondaryOnClick,
      children,
      ...props
    },
    ref
  ) => {
    const { background } = useHeroContext();
    const variants = buttonMap[background];

    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap items-center gap-3 pt-2", className)}
        {...props}
      >
        {primaryLabel &&
          (primaryHref ? (
            <Button variant={variants.primary}  href={primaryHref}>
              {primaryLabel}
            </Button>
          ) : (
            <Button variant={variants.primary} onClick={primaryOnClick}>
              {primaryLabel}
            </Button>
          ))}

        {secondaryLabel &&
          (secondaryHref ? (
            <Button variant={variants.secondary} href={secondaryHref}>
              {secondaryLabel}
            </Button>
          ) : (
            <Button variant={variants.secondary} onClick={secondaryOnClick}>
              {secondaryLabel}
            </Button>
          ))}

        {children}
      </div>
    );
  }
);
HeroActions.displayName = "HeroActions";

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  HeroSection,
  HeroContent,
  HeroMedia,
  HeroBadge,
  HeroEyebrow,
  HeroTitle,
  HeroSubTitle,
  HeroDescription,
  HeroActions,
};

export type {
  HeroRootProps,
  HeroActionsProps,
  HeroEyebrowProps,
  HeroTitleProps,
  HeroDescriptionProps,
};