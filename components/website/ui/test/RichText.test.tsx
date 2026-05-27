import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RichText } from "@/components/website/ui/RichText";

/**
 * Convención de tokens:
 * Los bloques "size", "color" y "weight" mapean 1:1 con los tokens en tokens.ts.
 * Al agregar un valor nuevo a textSizeTokens, colorTokens o weightTokens,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar color="danger":
 *   tokens.ts   → danger: "text-red-500"
 *   este archivo → ["danger", "text-red-500"],
 *   (repetir en Title.test.tsx y Paragraph.test.tsx)
 */

describe("RichText", () => {
  // ─── Tag semántico ───────────────────────────────────────────────────────

  it("renderiza como <p> por defecto", () => {
    render(<RichText>texto</RichText>);
    expect(screen.getByText("texto").tagName).toBe("P");
  });

  it.each([
    ["p",      "P"],
    ["span",   "SPAN"],
    ["strong", "STRONG"],
    ["em",     "EM"],
  ] as const)("as=%s renderiza el tag correcto", (as, tag) => {
    render(<RichText as={as}>texto</RichText>);
    expect(screen.getByText("texto").tagName).toBe(tag);
  });

  it('as="label" renderiza un <label>', () => {
    render(<RichText as="label" htmlFor="x">Label</RichText>);
    expect(screen.getByText("Label").tagName).toBe("LABEL");
  });

  it('as="label" tiene el atributo htmlFor', () => {
    render(<RichText as="label" htmlFor="mi-input">Label</RichText>);
    expect(screen.getByText("Label")).toHaveAttribute("for", "mi-input");
  });

  // ─── Sizes — textSizeTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a textSizeTokens, agregar una fila acá.

  it.each([
    ["xs", "text-sm"],
    ["sm", "text-base"],
    ["md", "text-xl"],
  ] as const)("size=%s aplica la clase correcta", (size, cls) => {
    render(<RichText size={size}>texto</RichText>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── Colors — colorTokens ────────────────────────────────────────────────
  // Al agregar un valor nuevo a colorTokens, agregar una fila acá.
  // (repetir también en Title.test.tsx y Paragraph.test.tsx)

  it.each([
    ["white",  "text-white"],
    ["muted",  "text-white/60"],
    ["accent", "text-brand-400"],
    ["black",  "text-black"],
  ] as const)("color=%s aplica la clase correcta", (color, cls) => {
    render(<RichText color={color}>texto</RichText>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── Weights — weightTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a weightTokens, agregar una fila acá.
  // (repetir también en Title.test.tsx y Paragraph.test.tsx)

  it.each([
    ["normal", "font-normal"],
    ["bold",   "font-bold"],
  ] as const)("weight=%s aplica la clase correcta", (weight, cls) => {
    render(<RichText weight={weight}>texto</RichText>);
    expect(screen.getByText("texto")).toHaveClass(cls);
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<RichText className="uppercase">texto</RichText>);
    expect(screen.getByText("texto")).toHaveClass("uppercase");
  });

  // ─── Composición ─────────────────────────────────────────────────────────

  it("permite composición con children anidados", () => {
    render(
      <RichText as="p" color="black">
        Hola{" "}
        <RichText as="strong" weight="bold" color="black">mundo</RichText>
      </RichText>
    );
    expect(screen.getByText("mundo").tagName).toBe("STRONG");
    expect(screen.getByText("mundo")).toHaveClass("font-bold");
  });
});
