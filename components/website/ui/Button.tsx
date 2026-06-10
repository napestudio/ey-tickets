"use client";
import * as React from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

import {
  buttonVariantTokens,
  buttonSizeTokens,
} from "@/components/website/ui/lib/design-system/tokens";
import type { ButtonVariant, ButtonSize } from "@/components/website/ui/lib/design-system/types";

// ─── Variantes ────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-nebulica font-bold transition-colors cursor-pointer",
  {
    variants: {
      variant: buttonVariantTokens,
      size:    buttonSizeTokens,
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface BaseProps {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  className?: string;
  children:   React.ReactNode;
}

type AsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
  };

type AsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

export type ButtonProps = AsButton | AsLink;

// ─── Componente ───────────────────────────────────────────────────────────────

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ variant, size, className, children, ...rest }, ref) => {
  const classes = cn(buttonVariants({ variant, size }), className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as AsLink;
    return (
      <Link
        href={href}
        className={classes}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      ref={ref as React.Ref<HTMLButtonElement>}
      {...(rest as AsButton)}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };