/**
 * @file types.ts
 * Contratos de tipos centralizados del design system.
 * Todos los componentes importan desde acá — nunca definen tipos localmente.
 *
 * Estructura:
 *  1. Typography
 *  2. Color
 *  3. Button
 *  4. Form
 *  5. Layout / Hero
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Typography
// ─────────────────────────────────────────────────────────────────────────────

/** Tamaños disponibles para Text y Paragraph (sin display). */
export type TextSize = "xs" | "sm" | "md";

/** Tamaños disponibles para Title (incluye display). */
export type TitleSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Tags semánticos válidos para Text (inline / párrafo). */
export type InlineTag = "p" | "span" | "strong" | "em";

/** Tags semánticos válidos para Title. */
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Peso tipográfico compartido por todos los primitivos de texto. */
export type FontWeight = "normal" | "bold";

// ─────────────────────────────────────────────────────────────────────────────
// 2. Color
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paleta de colores de texto del sistema.
 * Usada por Text, Title, Paragraph, Card, Hero y cualquier primitivo tipográfico.
 */
export type TextColor = "white" | "muted" | "accent" | "black";

// ─────────────────────────────────────────────────────────────────────────────
// 3. Button
// ─────────────────────────────────────────────────────────────────────────────

/** Variantes visuales del Button. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "link";

/** Tamaños del Button. */
export type ButtonSize = "sm" | "md" | "lg";

// ─────────────────────────────────────────────────────────────────────────────
// 4. Form
// ─────────────────────────────────────────────────────────────────────────────

/** Estado del borde en inputs y textareas. */
export type BorderState = "default" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// 5. Layout / Hero
// ─────────────────────────────────────────────────────────────────────────────

/** Backgrounds disponibles para HeroSection. Determina los colores de texto automáticos. */
export type HeroBackground = "none" | "muted" | "primary" | "dark";

/** Layouts disponibles para HeroSection. */
export type HeroLayout = "centered" | "split" | "split-reverse" | "fullscreen";