import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/website/ui/Input";

/**
 * Convención de tokens:
 * Los bloques "size" y "border" mapean 1:1 con los tokens en tokens.ts.
 * Al agregar un valor nuevo a textSizeTokens o borderStateTokens,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar border="warning":
 *   tokens.ts   → warning: "border-yellow-500"
 *   este archivo → ["warning", "border-yellow-500"],
 *   (repetir también en Textarea.test.tsx)
 */

describe("Input", () => {
  // ─── Renderizado base ────────────────────────────────────────────────────

  it("renderiza un input en el DOM", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("muestra el placeholder", () => {
    render(<Input placeholder="Escribí acá" />);
    expect(screen.getByPlaceholderText("Escribí acá")).toBeInTheDocument();
  });

  it("acepta type nativo", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  // ─── Borders — borderStateTokens ────────────────────────────────────────
  // Al agregar un valor nuevo a borderStateTokens, agregar una fila acá.
  // (repetir también en Textarea.test.tsx)

  it.each([
    ["default", "border-input"],
    ["error",   "border-red-500"],
  ] as const)("border=%s aplica la clase correcta", (border, cls) => {
    render(<Input border={border} />);
    expect(screen.getByRole("textbox")).toHaveClass(cls);
  });

  // ─── Sizes — textSizeTokens ──────────────────────────────────────────────
  // Al agregar un valor nuevo a textSizeTokens, agregar una fila acá.

  it.each([
    ["xs", "text-sm"],
    ["sm", "text-base"],
    ["md", "text-xl"],
  ] as const)("size=%s aplica la clase tipográfica correcta", (size, cls) => {
    render(<Input size={size} />);
    expect(screen.getByRole("textbox")).toHaveClass(cls);
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<Input className="max-w-xs" />);
    expect(screen.getByRole("textbox")).toHaveClass("max-w-xs");
  });

  // ─── Interacciones ───────────────────────────────────────────────────────

  it("permite escribir texto", async () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hola mundo");
    expect(input).toHaveValue("hola mundo");
  });

  it("llama onChange al escribir", async () => {
    const handler = vi.fn();
    render(<Input onChange={handler} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(handler).toHaveBeenCalled();
  });

  it("no permite escribir cuando está disabled", async () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "texto");
    expect(input).toHaveValue("");
  });

  // ─── Accesibilidad ───────────────────────────────────────────────────────

  it("se asocia con un label via id", () => {
    render(
      <>
        <label htmlFor="test-input">Email</label>
        <Input id="test-input" type="email" />
      </>
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("acepta aria-invalid en estado de error", () => {
    render(<Input border="error" aria-invalid="true" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
