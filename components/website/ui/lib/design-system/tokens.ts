/**
 * @file tokens.ts
 * Tokens de diseño — mapeo de nombres semánticos a clases de Tailwind.
 * Los tipos derivados viven en types.ts, no acá.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Typography — size
// ─────────────────────────────────────────────────────────────────────────────

const allSizeTokens = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-xl",
  lg: "text-4xl",
  xl: "text-8xl",
} as const;

/** xs | sm | md — para Text y Paragraph. Sin display. */
export const textSizeTokens = {
  xs: allSizeTokens.xs,
  sm: allSizeTokens.sm,
  md: allSizeTokens.md,
} as const;

/** xs | sm | md | lg | xl — para Title. Incluye display. */
export const titleSizeTokens = {
  xs: allSizeTokens.xs,
  sm: allSizeTokens.sm,
  md: allSizeTokens.md,
  lg: allSizeTokens.lg,
  xl: allSizeTokens.xl,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography — weight
// ─────────────────────────────────────────────────────────────────────────────

export const weightTokens = {
  normal: "font-normal",
  bold:   "font-bold",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Color
// ─────────────────────────────────────────────────────────────────────────────

export const colorTokens = {
  white:  "text-white",
  muted:  "text-white/60",
  accent: "text-brand-400",
  black:  "text-black",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────────────────────

export const buttonVariantTokens = {
  primary:   "bg-black text-white",
  secondary: "bg-transparent border border-white text-black",
  outline:   "bg-transparent border border-black text-black",
  link:      "bg-transparent text-black underline-offset-4 hover:underline",
} as const;

export const buttonSizeTokens = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-xl px-8 py-4",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Form
// ─────────────────────────────────────────────────────────────────────────────

export const borderStateTokens = {
  default: "border-input",
  error:   "border-red-500",
} as const;