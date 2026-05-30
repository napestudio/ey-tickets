# Testing — Design System

Guía de referencia para escribir y mantener tests unitarios de los componentes primitivos.

---

## Stack

| Herramienta | Rol |
|---|---|
| [Vitest](https://vitest.dev) | Runner y assertions |
| [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro) | Renderizado y queries |
| [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) | Simulación de interacciones |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | Matchers de DOM (`toHaveClass`, `toBeInTheDocument`, etc.) |

---

## Setup

### Instalación

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### `vitest.setup.ts`

```typescript
import "@testing-library/jest-dom";
```

### `package.json`

```json
"scripts": {
  "test":          "vitest",
  "test:ui":       "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

---

## Convenciones

### Estructura de archivos

Los archivos de test viven junto al componente que testean:

```
components/website/ui/
├── Button.tsx
├── Button.test.tsx
├── Input.tsx
├── Input.test.tsx
└── ...
```

### Estructura interna de cada test

Cada archivo sigue esta estructura con secciones separadas por comentarios:

```typescript
describe("NombreComponente", () => {
  // ─── Renderizado base ──────────────────────────────────────────────────
  // ─── Variantes de X ───────────────────────────────────────────────────
  // ─── Interacciones ────────────────────────────────────────────────────
  // ─── Accesibilidad ────────────────────────────────────────────────────
});
```

### Queries preferidas

Usar siempre las queries más semánticas disponibles, en este orden de preferencia:

```typescript
// ✅ Preferido — refleja lo que el usuario ve
screen.getByRole("button", { name: "Enviar" })
screen.getByRole("heading", { level: 2 })
screen.getByLabelText("Email")
screen.getByPlaceholderText("hola@empresa.com")

// ⚠️ Aceptable cuando no hay alternativa semántica
screen.getByText("texto")

// ❌ Evitar — acopla los tests a detalles de implementación
screen.getByTestId("mi-boton")
container.querySelector(".btn-primary")
```

---

## Qué testear en cada tipo de componente

### Componentes de tipografía (`RichText`, `Title`, `Paragraph`)

| Qué | Ejemplo |
|---|---|
| Tag semántico correcto | `expect(el.tagName).toBe("P")` |
| Cada variante CVA → clase Tailwind | `toHaveClass("text-base")` |
| Valores default sin props | `toHaveClass("font-normal")` |
| `className` adicional no pisa variantes | `toHaveClass("uppercase")` |
| Accesibilidad (`htmlFor` en label) | `toHaveAttribute("for", "mi-input")` |

### Componentes de formulario (`Input`, `Textarea`)

| Qué | Ejemplo |
|---|---|
| Renderiza el elemento nativo | `getByRole("textbox")` |
| Placeholder visible | `getByPlaceholderText(...)` |
| Variante `border=error` | `toHaveClass("border-red-500")` |
| Permite escribir texto | `userEvent.type(...)` + `toHaveValue(...)` |
| `disabled` bloquea escritura | `toHaveValue("")` después de `type` |
| Asociación con label via `id` | `getByLabelText(...)` |
| `aria-invalid` en estado error | `toHaveAttribute("aria-invalid", "true")` |

### Componente polimórfico (`Button`)

| Qué | Ejemplo |
|---|---|
| Renderiza `<button>` sin `href` | `getByRole("button")` |
| Renderiza `<a>` con `href` | `getByRole("link")` |
| `href` correcto en el anchor | `toHaveAttribute("href", "/ruta")` |
| `onClick` se llama al hacer click | `vi.fn()` + `toHaveBeenCalledTimes(1)` |
| `disabled` bloquea el click | `not.toHaveBeenCalled()` |
| `type=submit` en forms | `toHaveAttribute("type", "submit")` |

---

## Convención para tokens nuevos

**Regla:** cada vez que se agrega un valor nuevo a `tokens.ts`, se agrega el test correspondiente en el mismo commit.

### Ejemplo — agregar `weight="medium"`

**1. Agregar el token:**

```typescript
// tokens.ts
export const weightTokens = {
  normal: "font-normal",
  medium: "font-medium", // nuevo
  bold:   "font-bold",
} as const;
```

**2. Agregar el test antes o junto al token:**

```typescript
// Paragraph.test.tsx (y en los otros componentes que usen weightTokens)
it("weight=medium aplica font-medium", () => {
  render(<Paragraph weight="medium">texto</Paragraph>);
  expect(screen.getByText("texto")).toHaveClass("font-medium");
});
```

Si el test se escribe antes de implementar el token, falla en rojo — comportamiento esperado. Una vez agregado el token, vuelve a verde.

### Ejemplo — agregar `color="danger"`

```typescript
// tokens.ts
export const colorTokens = {
  // ...existentes
  danger: "text-red-500", // nuevo
} as const;
```

```typescript
// RichText.test.tsx, Title.test.tsx, Paragraph.test.tsx
it("color=danger aplica text-red-500", () => {
  render(<Paragraph color="danger">texto</Paragraph>);
  expect(screen.getByText("texto")).toHaveClass("text-red-500");
});
```

> **Nota:** TypeScript valida en compilación que no se pasen variantes inexistentes.
> Los tests de tokens cubren que los valores *válidos* produzcan las clases correctas,
> no que los valores inválidos sean rechazados — eso ya lo garantiza el sistema de tipos.

---

## Correr los tests

```bash
# Modo watch (desarrollo)
npm test

# Una sola corrida (CI)
npx vitest run

# Con UI interactiva
npm run test:ui

# Con cobertura
npm run test:coverage
```
