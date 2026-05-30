import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/website/ui/Button";

/**
 * Convención de tokens:
 * Cada valor en buttonVariantTokens y buttonSizeTokens debe tener un test
 * en el bloque correspondiente. Al agregar una variante nueva al token,
 * agregar la fila al it.each del bloque correcto en el mismo commit.
 *
 * Ejemplo — agregar variant="destructive":
 *   tokens.ts   → destructive: "bg-red-600 text-white hover:bg-red-700"
 *   este archivo → ["destructive", "bg-red-600"],
 */

describe("Button", () => {
  // ─── Renderizado base ────────────────────────────────────────────────────

  it("renderiza el texto correctamente", () => {
    render(<Button>Hola</Button>);
    expect(screen.getByRole("button", { name: "Hola" })).toBeInTheDocument();
  });

  it("renderiza como <button> por defecto", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renderiza como <a> cuando se pasa href", () => {
    render(<Button href="/dashboard">Dashboard</Button>);
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("el link tiene el href correcto", () => {
    render(<Button href="/docs">Docs</Button>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/docs");
  });

  // ─── Variantes — buttonVariantTokens ────────────────────────────────────
  // Al agregar un valor nuevo a buttonVariantTokens, agregar una fila acá.

  it.each([
    ["primary",   "bg-black"],
    ["secondary", "bg-transparent"],
    ["ghost",     "bg-transparent"],
    ["outline",   "bg-transparent"],
    ["link",      "bg-transparent"],
  ] as const)("variant=%s aplica la clase base correcta", (variant, cls) => {
    render(<Button variant={variant}>btn</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  // ─── Sizes — buttonSizeTokens ────────────────────────────────────────────
  // Al agregar un valor nuevo a buttonSizeTokens, agregar una fila acá.

  it.each([
    ["sm", "px-4"],
    ["md", "px-6"],
    ["lg", "px-8"],
  ] as const)("size=%s aplica el padding correcto", (size, cls) => {
    render(<Button size={size}>btn</Button>);
    expect(screen.getByRole("button")).toHaveClass(cls);
  });

  // ─── className extra ─────────────────────────────────────────────────────

  it("acepta className adicional", () => {
    render(<Button className="w-full">btn</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  // ─── Interacciones ───────────────────────────────────────────────────────

  it("llama onClick al hacer click", async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("no llama onClick cuando está disabled", async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });

  // ─── Accesibilidad ───────────────────────────────────────────────────────

  it("acepta aria-label", () => {
    render(<Button aria-label="Cerrar modal">✕</Button>);
    expect(screen.getByRole("button", { name: "Cerrar modal" })).toBeInTheDocument();
  });

  it("acepta type=submit", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
