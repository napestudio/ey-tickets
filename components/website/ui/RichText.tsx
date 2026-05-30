"use client";
import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

import { textSizeTokens, colorTokens, weightTokens } from "@/components/website/ui/lib/design-system/tokens";
import { InlineTag } from "./lib/design-system/types"; 

const textVariants = cva("font-base-neue", {
  variants: {
    size:   textSizeTokens,   // solo xs | sm | md
    color:  colorTokens,
    weight: weightTokens,
  },
  // Default "black" para evitar texto invisible sobre fondos blancos
  defaultVariants: { size: "sm", color: "black", weight: "normal" },
});

interface RichTextBaseProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof textVariants> {
  as?: InlineTag;
}

interface RichTextProps
  extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "color">,
    VariantProps<typeof textVariants> {
  as: "label";
  /** Requerido cuando as="label" para mantener accesibilidad. */
  htmlFor: string;
}

type TextProps = RichTextBaseProps | RichTextProps;

// ─── Componente ───────────────────────────────────────────────────────────────

const RichText = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = "p", size, color, weight, className, ...rest }, ref) => {
    const Component = Tag as React.ElementType;

    /*if (process.env.NODE_ENV === "development") {
      // Aviso en dev si se usa label sin htmlFor (guard runtime para JS puro)
      if (Tag === "label" && !("htmlFor" in rest && rest.htmlFor)) {
        console.warn(
          '[Text] as="label" requiere la prop `htmlFor` para ser accesible.'
        );
      }
      // Aviso si elementos inline reciben clases de bloque
      const inlineTags: InlineTag[] = ["span", "strong", "em"];
      if (
        inlineTags.includes(Tag as InlineTag) &&
        typeof className === "string" &&
        /\b(flex|grid|block|inline-block)\b/.test(className)
      ) {
        console.warn(
          `[Text] as="${Tag}" es un elemento inline. Clases de bloque como flex/grid pueden generar comportamiento inesperado.`
        );
      }
    } consultar */ 

    return (
      <Component
        ref={ref}
        className={cn(textVariants({ size, color, weight }), className)}
        {...rest}
      />
    );
  }
);
RichText.displayName = "RichText";

export { RichText };
export type { TextProps, RichTextBaseProps, RichTextProps };