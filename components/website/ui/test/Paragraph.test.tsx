import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Paragraph } from "@/components/website/ui/Paragraph";

/**
 * Convención de tokens:
 * Los bloques "size", "color" y "weight" mapean 1:1 con los tokens en tokens.ts.
 * Al agregar un valor nuevo a textSizeTokens, colorTokens o weightTokens,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar weight="medium":
 *   tokens.ts   → medium: "font-medium"
 *   este archivo → ["medium", "font-medium"],
 *   (repetir también en RichText.test.tsx y Title.test.tsx)
 */

describe("Paragraph", () => {
  // ─── Renderizado base ────────────────────────────────────────────────────

  it("renderiza siempre como <p>", () => {
    render(<Paragraph>texto</Paragraph>);
    expect(screen.getByText("texto").tagName).toBe("P");
  });

  it("renderiza el texto correctamente", () => {
    render(<Paragraph>Hola mundo</Paragraph>);
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
  });

  // ─── Sizes — textSizeTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a textSizeTokens, agregar una fila acá.
  // (repetir también en RichText.test.tsx)

  it.each([
    ["xs", "text-sm"],
    ["sm", "text-base"],
    ["md", "text-xl"],
  ] as const)("size=%s aplica la clase correcta", (size, cls) => {
    render(<Paragraph size={size}>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── Colors — colorTokens ────────────────────────────────────────────────
  // Al agregar un valor nuevo a colorTokens, agregar una fila acá.
  // (repetir también en RichText.test.tsx y Title.test.tsx)

  it.each([
    ["white",  "text-white"],
    ["muted",  "text-white/60"],
    ["accent", "text-brand-400"],
    ["black",  "text-black"],
  ] as const)("color=%s aplica la clase correcta", (color, cls) => {
    render(<Paragraph color={color}>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── Weights — weightTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a weightTokens, agregar una fila acá.
  // (repetir también en RichText.test.tsx y Title.test.tsx)

  it.each([
    ["normal", "font-normal"],
    ["bold",   "font-bold"],
  ] as const)("weight=%s aplica la clase correcta", (weight, cls) => {
    render(<Paragraph weight={weight}>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── Defaults ────────────────────────────────────────────────────────────

  it("aplica size=sm por defecto", () => {
    render(<Paragraph>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass("text-base");
  });

  it("aplica color=black por defecto", () => {
    render(<Paragraph>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass("text-black");
  });

  it("aplica weight=normal por defecto", () => {
    render(<Paragraph>texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass("font-normal");
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<Paragraph className="max-w-prose">texto</Paragraph>);
    expect(screen.getByText("texto")).toHaveClass("max-w-prose");
  });
});
