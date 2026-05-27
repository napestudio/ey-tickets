import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/website/ui/TextArea";

/**
 * Convención de tokens:
 * Los bloques "size" y "border" mapean 1:1 con los tokens en tokens.ts.
 * Al agregar un valor nuevo a textSizeTokens o borderStateTokens,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar border="warning":
 *   tokens.ts   → warning: "border-yellow-500"
 *   este archivo → ["warning", "border-yellow-500"],
 *   (repetir también en Input.test.tsx)
 */

describe("Textarea", () => {
  // ─── Renderizado base ────────────────────────────────────────────────────

  it("renderiza un textarea en el DOM", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("muestra el placeholder", () => {
    render(<Textarea placeholder="Escribí tu mensaje" />);
    expect(screen.getByPlaceholderText("Escribí tu mensaje")).toBeInTheDocument();
  });

  // ─── Borders — borderStateTokens ────────────────────────────────────────
  // Al agregar un valor nuevo a borderStateTokens, agregar una fila acá.
  // (repetir también en Input.test.tsx)

  it.each([
    ["default", "border-input"],
    ["error",   "border-red-500"],
  ] as const)("border=%s aplica la clase correcta", (border, cls) => {
    render(<Textarea border={border} />);
    expect(screen.getByRole("textbox")).toHaveClass(cls);
  });

  // ─── Sizes — textSizeTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a textSizeTokens, agregar una fila acá.

  it.each([
    ["xs", "text-sm"],
    ["sm", "text-base"],
    ["md", "text-xl"],
  ] as const)("size=%s aplica la clase tipográfica correcta", (size, cls) => {
    render(<Textarea size={size} />);
    expect(screen.getByRole("textbox")).toHaveClass(cls);
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<Textarea className="max-w-sm" />);
    expect(screen.getByRole("textbox")).toHaveClass("max-w-sm");
  });

  // ─── Interacciones ───────────────────────────────────────────────────────

  it("permite escribir texto multilinea", async () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "linea 1{enter}linea 2");
    expect(textarea).toHaveValue("linea 1\nlinea 2");
  });

  it("llama onChange al escribir", async () => {
    const handler = vi.fn();
    render(<Textarea onChange={handler} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(handler).toHaveBeenCalled();
  });

  it("no permite escribir cuando está disabled", async () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "texto");
    expect(textarea).toHaveValue("");
  });

  // ─── Accesibilidad ───────────────────────────────────────────────────────

  it("se asocia con un label via id", () => {
    render(
      <>
        <label htmlFor="test-textarea">Mensaje</label>
        <Textarea id="test-textarea" />
      </>
    );
    expect(screen.getByLabelText("Mensaje")).toBeInTheDocument();
  });

  it("acepta aria-invalid en estado de error", () => {
    render(<Textarea border="error" aria-invalid="true" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("acepta rows para controlar la altura inicial", () => {
    render(<Textarea rows={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });
});
