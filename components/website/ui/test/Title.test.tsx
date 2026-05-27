import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Title } from "@/components/website/ui/Title";

/**
 * Convención de tokens:
 * Los bloques "size", "color" y "weight" mapean 1:1 con los tokens en tokens.ts.
 * Al agregar un valor nuevo a titleSizeTokens, colorTokens o weightTokens,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar size="2xl":
 *   tokens.ts   → 2xl: "text-[10rem]"
 *   este archivo → ["2xl", "text-[10rem]"],
 */

describe("Title", () => {
  // ─── Tag semántico ───────────────────────────────────────────────────────

  it("renderiza como <h2> por defecto", () => {
    render(<Title>Título</Title>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4, 5, 6] as const)("as=h%i renderiza el heading correcto", (level) => {
    render(<Title as={`h${level}`}>Título</Title>);
    expect(screen.getByRole("heading", { level })).toBeInTheDocument();
  });

  // ─── Sizes — titleSizeTokens ─────────────────────────────────────────────
  // Al agregar un valor nuevo a titleSizeTokens, agregar una fila acá.

  it.each([
    ["xs", "text-sm"],
    ["sm", "text-base"],
    ["md", "text-xl"],
    ["lg", "text-4xl"],
    ["xl", "text-8xl"],
  ] as const)("size=%s aplica la clase correcta", (size, cls) => {
    render(<Title size={size}>Título</Title>);
    expect(screen.getByRole("heading")).toHaveClass(cls);
  });

  // ─── Colors — colorTokens ────────────────────────────────────────────────
  // Al agregar un valor nuevo a colorTokens, agregar una fila acá.
  // (repetir también en RichText.test.tsx y Paragraph.test.tsx)

  it.each([
    ["white",  "text-white"],
    ["muted",  "text-white/60"],
    ["accent", "text-brand-400"],
    ["black",  "text-black"],
  ] as const)("color=%s aplica la clase correcta", (color, cls) => {
    render(<Title color={color}>Título</Title>);
    expect(screen.getByRole("heading")).toHaveClass(cls);
  });

  // ─── Weights — weightTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a weightTokens, agregar una fila acá.
  // (repetir también en RichText.test.tsx y Paragraph.test.tsx)

  it.each([
    ["normal", "font-normal"],
    ["bold",   "font-bold"],
  ] as const)("weight=%s aplica la clase correcta", (weight, cls) => {
    render(<Title weight={weight}>Título</Title>);
    expect(screen.getByRole("heading")).toHaveClass(cls);
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<Title className="tracking-tight">Título</Title>);
    expect(screen.getByRole("heading")).toHaveClass("tracking-tight");
  });

  // ─── Contenido ───────────────────────────────────────────────────────────

  it("renderiza el texto correctamente", () => {
    render(<Title>Mi título</Title>);
    expect(screen.getByRole("heading", { name: "Mi título" })).toBeInTheDocument();
  });
});
