import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  HeroSection,
  HeroContent,
  HeroMedia,
  HeroBadge,
  HeroEyebrow,
  HeroTitle,
  HeroSubTitle,
  HeroDescription,
  HeroActions,
} from "@/components/website/features/HeroSection";

/**
 * Convención de tokens:
 * Los bloques de background y layout mapean 1:1 con heroVariants en HeroSection.tsx.
 * Al agregar un valor nuevo a HeroBackground o HeroLayout en types.ts,
 * agregar la fila correspondiente al it.each del bloque correcto en el mismo commit.
 *
 * Al modificar textMap o buttonMap en HeroSection.tsx, verificar que los tests
 * de "resolución automática de colores" sigan siendo correctos.
 */

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Wrapper mínimo para renderizar HeroSection con contenido observable.
 * Acepta overrides para testear variantes específicas.
 */
function renderHero(
  props: Partial<React.ComponentProps<typeof HeroSection>> = {},
  content: React.ReactNode = <HeroContent><p>contenido</p></HeroContent>
) {
  return render(
    <HeroSection {...props}>
      {content}
    </HeroSection>
  );
}

// ─── HeroSection root ─────────────────────────────────────────────────────────

describe("HeroSection", () => {
  it("renderiza un div en el DOM", () => {
    renderHero();
    expect(screen.getByText("contenido").closest("div")).toBeInTheDocument();
  });

  // ─── Layouts — HeroLayout ──────────────────────────────────────────────────
  // Al agregar un valor nuevo a HeroLayout, agregar una fila acá.

  it.each([
    ["centered",       "flex-col"],
    ["split",          "flex-row"],
    ["split-reverse",  "flex-row-reverse"],
    ["fullscreen",     "flex-col"],
  ] as const)("layout=%s aplica la clase base correcta", (layout, cls) => {
    const { container } = renderHero({ layout });
    expect(container.firstChild).toHaveClass(cls);
  });

  // ─── Backgrounds — HeroBackground ─────────────────────────────────────────
  // Al agregar un valor nuevo a HeroBackground, agregar una fila acá.
  // También actualizar textMap y buttonMap en HeroSection.tsx.

  it.each([
    ["muted",   "bg-muted"],
    ["primary", "bg-primary"],
    ["dark",    "bg-gray-950"],
  ] as const)("background=%s aplica la clase correcta", (background, cls) => {
    const { container } = renderHero({ background });
    expect(container.firstChild).toHaveClass(cls);
  });

  it("background=none no aplica clase de fondo", () => {
    const { container } = renderHero({ background: "none" });
    expect(container.firstChild).not.toHaveClass("bg-muted");
    expect(container.firstChild).not.toHaveClass("bg-primary");
    expect(container.firstChild).not.toHaveClass("bg-gray-950");
  });

  it("acepta className adicional", () => {
    const { container } = renderHero({ className: "rounded-xl" });
    expect(container.firstChild).toHaveClass("rounded-xl");
  });
});

// ─── HeroContent ──────────────────────────────────────────────────────────────

describe("HeroContent", () => {
  it("renderiza sus children", () => {
    render(
      <HeroSection>
        <HeroContent>
          <p>hijo</p>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("hijo")).toBeInTheDocument();
  });

  it("acepta className adicional", () => {
    render(
      <HeroSection>
        <HeroContent className="gap-10">
          <p>hijo</p>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("hijo").parentElement).toHaveClass("gap-10");
  });
});

// ─── HeroMedia ────────────────────────────────────────────────────────────────

describe("HeroMedia", () => {
  it("renderiza sus children", () => {
    render(
      <HeroSection>
        <HeroMedia>
          <img alt="media" src="/img.jpg" />
        </HeroMedia>
      </HeroSection>
    );
    expect(screen.getByAltText("media")).toBeInTheDocument();
  });
});

// ─── HeroBadge ────────────────────────────────────────────────────────────────

describe("HeroBadge", () => {
  it("renderiza como span", () => {
    render(
      <HeroSection>
        <HeroBadge>Nuevo</HeroBadge>
      </HeroSection>
    );
    expect(screen.getByText("Nuevo").tagName).toBe("SPAN");
  });

  it("tiene las clases base de badge", () => {
    render(
      <HeroSection>
        <HeroBadge>v2.0</HeroBadge>
      </HeroSection>
    );
    expect(screen.getByText("v2.0")).toHaveClass("rounded-full", "border");
  });
});

// ─── HeroEyebrow ──────────────────────────────────────────────────────────────

describe("HeroEyebrow", () => {
  it("renderiza el texto", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroEyebrow>Eyebrow</HeroEyebrow>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Eyebrow")).toBeInTheDocument();
  });

  // ─── Resolución automática de color por contexto ───────────────────────────
  // Si modificás textMap en HeroSection.tsx, verificar estas expectativas.

  it.each([
    ["none",    "text-black"],
    ["muted",   "text-black"],
    ["primary", "text-brand-400"], // accent
    ["dark",    "text-brand-400"], // accent
  ] as const)("background=%s resuelve el color de eyebrow automáticamente", (background, cls) => {
    render(
      <HeroSection background={background}>
        <HeroContent>
          <HeroEyebrow>Eyebrow</HeroEyebrow>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Eyebrow")).toHaveClass(cls);
  });

  it("color prop manual anula el contexto", () => {
    render(
      <HeroSection background="dark">
        <HeroContent>
          <HeroEyebrow color="white">Eyebrow</HeroEyebrow>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Eyebrow")).toHaveClass("text-white");
  });
});

// ─── HeroTitle ────────────────────────────────────────────────────────────────

describe("HeroTitle", () => {
  it("renderiza como h1", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroTitle>Título</HeroTitle>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Título" })).toBeInTheDocument();
  });

  // ─── Resolución automática de color por contexto ───────────────────────────
  // Si modificás textMap en HeroSection.tsx, verificar estas expectativas.

  it.each([
    ["none",    "text-black"],
    ["muted",   "text-black"],
    ["primary", "text-white"],
    ["dark",    "text-white"],
  ] as const)("background=%s resuelve el color de título automáticamente", (background, cls) => {
    render(
      <HeroSection background={background}>
        <HeroContent>
          <HeroTitle>Título</HeroTitle>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(cls);
  });

  it("color prop manual anula el contexto", () => {
    render(
      <HeroSection background="dark">
        <HeroContent>
          <HeroTitle color="accent">Título</HeroTitle>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-brand-400");
  });
});

// ─── HeroSubTitle ─────────────────────────────────────────────────────────────

describe("HeroSubTitle", () => {
  it("renderiza como h2", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroSubTitle>Subtítulo</HeroSubTitle>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("heading", { level: 2, name: "Subtítulo" })).toBeInTheDocument();
  });

  it("color prop manual anula el contexto", () => {
    render(
      <HeroSection background="none">
        <HeroContent>
          <HeroSubTitle color="accent">Subtítulo</HeroSubTitle>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-brand-400");
  });
});

// ─── HeroDescription ──────────────────────────────────────────────────────────

describe("HeroDescription", () => {
  it("renderiza el texto", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroDescription>Descripción</HeroDescription>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  // ─── Resolución automática de color por contexto ───────────────────────────
  // Si modificás textMap en HeroSection.tsx, verificar estas expectativas.

  it.each([
    ["none",    "text-black"],
    ["muted",   "text-black"],
    ["primary", "text-white/60"], // muted
    ["dark",    "text-white/60"], // muted
  ] as const)("background=%s resuelve el color de descripción automáticamente", (background, cls) => {
    render(
      <HeroSection background={background}>
        <HeroContent>
          <HeroDescription>Descripción</HeroDescription>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Descripción")).toHaveClass(cls);
  });

  it("color prop manual anula el contexto", () => {
    render(
      <HeroSection background="dark">
        <HeroContent>
          <HeroDescription color="white">Descripción</HeroDescription>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("Descripción")).toHaveClass("text-white");
  });
});

// ─── HeroActions ──────────────────────────────────────────────────────────────

describe("HeroActions", () => {
  it("renderiza el botón primario", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions primaryLabel="Primario" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("button", { name: "Primario" })).toBeInTheDocument();
  });

  it("renderiza el botón secundario", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions secondaryLabel="Secundario" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("button", { name: "Secundario" })).toBeInTheDocument();
  });

  it("renderiza ambos botones juntos", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions primaryLabel="Primario" secondaryLabel="Secundario" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("button", { name: "Primario" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Secundario" })).toBeInTheDocument();
  });

  it("primaryHref renderiza el botón primario como link", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions primaryLabel="Ir" primaryHref="/dashboard" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("link", { name: "Ir" })).toHaveAttribute("href", "/dashboard");
  });

  it("secondaryHref renderiza el botón secundario como link", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions secondaryLabel="Docs" secondaryHref="/docs" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("no renderiza botones si no se pasan labels", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renderiza children adicionales junto a los botones", () => {
    render(
      <HeroSection>
        <HeroContent>
          <HeroActions primaryLabel="Primario">
            <span>o contactanos</span>
          </HeroActions>
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByText("o contactanos")).toBeInTheDocument();
  });

  // ─── Variantes de botón por contexto ──────────────────────────────────────
  // Si modificás buttonMap en HeroSection.tsx, verificar estas expectativas.

  it.each([
    ["none",    "bg-black"],      // primary → primary
    ["muted",   "bg-black"],      // primary → primary
    ["primary", "bg-black"],      // primary → primary
    ["dark",    "bg-black"],      // primary → primary
  ] as const)("background=%s aplica la variante correcta al botón primario", (background, cls) => {
    render(
      <HeroSection background={background}>
        <HeroContent>
          <HeroActions primaryLabel="Acción" />
        </HeroContent>
      </HeroSection>
    );
    expect(screen.getByRole("button", { name: "Acción" })).toHaveClass(cls);
  });
});
