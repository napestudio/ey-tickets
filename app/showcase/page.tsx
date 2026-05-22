import { RichText } from "@/components/website/ui/Text";
import { Title } from "@/components/website/ui/Title";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/website/ui/Card";
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
import { Input } from "@/components/ui/input";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 border-b border-gray-100 last:border-none">
      <div className="mb-10">
        <RichText as="span" className="text-xs font-mono tracking-widest text-gray-400 uppercase">
          Primitivo
        </RichText>
        <Title as="h2" className="text-3xl font-bold text-black mt-1">
          {title}
        </Title>
        {description && (
          <RichText as="p" className="text-sm text-gray-500 mt-2 max-w-lg">
            {description}
          </RichText>
        )}
      </div>
      {children}
    </section>
  );
}

function VariantBlock({
  label,
  bg = "bg-white",
  children,
}: {
  label: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <RichText
        as="span"
        className="text-[11px] font-mono text-gray-400 tracking-wider uppercase"
      >
        {label}
      </RichText>
      <div
        className={`rounded-lg border border-gray-100 px-6 py-5 ${bg} flex flex-wrap items-center gap-4`}
      >
        {children}
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-10 max-w-6xl mx-auto">
        <RichText className="text-xs font-mono tracking-widest text-gray-400 uppercase">
          Design System
        </RichText>
        <Title
          as="h1"
          className="text-5xl font-bold text-black mt-2 tracking-tight"
        >
          Primitivos
        </Title>
        <RichText className="text-gray-500 mt-3 text-sm max-w-md">
          Referencia visual de todos los componentes primitivos del sistema.
          Cada sección muestra las variantes disponibles y sus casos de uso.
        </RichText>
      </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* ─── Text ──────────────────────────────────────────────── */}
        <Section
          title="Text"
          description="Componente base para texto corrido. Soporta p, span, strong, em y label."
        >
          <Grid>
            <VariantBlock label="size">
              <RichText as="p" size="xs" color="black">
                xs — Texto pequeño
              </RichText>
              <RichText as="p" size="sm" color="black">
                sm — Texto base
              </RichText>
              <RichText as="p" size="md" color="black">
                md — Texto medio
              </RichText>
            </VariantBlock>

            <VariantBlock label="color" bg="bg-gray-950">
              <RichText as="p" color="white">
                white
              </RichText>
              <RichText as="p" color="muted">
                muted
              </RichText>
              <RichText as="p" color="accent" className="bg-white px-2 rounded">
                accent
              </RichText>
              <RichText as="p" color="black" className="bg-white px-2 rounded">
                black
              </RichText>
            </VariantBlock>

            <VariantBlock label="weight">
              <RichText as="p" color="black" weight="normal">
                normal — The quick brown fox
              </RichText>
              <RichText as="p" color="black" weight="bold">
                bold — The quick brown fox
              </RichText>
            </VariantBlock>

            <VariantBlock label="as — tags semánticos">
              <RichText as="p" color="black">
                as=&quot;p&quot; — párrafo
              </RichText>
              <RichText as="span" color="black">
                as=&quot;span&quot; — inline
              </RichText>
              <RichText as="strong" color="black" weight="bold">
                as=&quot;strong&quot; — énfasis fuerte
              </RichText>
              <RichText as="em" color="black">
                as=&quot;em&quot; — énfasis
              </RichText>
            </VariantBlock>

            <VariantBlock label='as="label" — accesible con htmlFor'>
              <div className="flex flex-col gap-1">
                <RichText
                  as="label"
                  htmlFor="demo-input"
                  color="black"
                  size="xs"
                  weight="bold"
                >
                  Email
                </RichText>
                <Input
                  id="demo-input"
                  type="email"
                  placeholder="hola@empresa.com"
                  className="border border-gray-200 rounded px-3 py-1.5 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            </VariantBlock>

            <VariantBlock label="composición — strong dinámico">
              <RichText as="p" color="black">
                El usuario{" "}
                <RichText as="strong" color="black" weight="bold">
                  Juan Pérez
                </RichText>{" "}
                inició sesión correctamente.
              </RichText>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Title ─────────────────────────────────────────────── */}
        <Section
          title="Title"
          description="Headings semánticos con escala tipográfica de display. h1–h6 disponibles."
        >
          <Grid>
            <VariantBlock label="size">
              <div className="flex flex-col gap-3 w-full">
                <Title>
                  xl — Display grande
                </Title>
                <Title as="h2">
                  lg — Display medio
                </Title>
                <Title as="h3">
                  md — Heading sección
                </Title>
                <Title as="h4">
                  sm — Subheading
                </Title>
                <Title as="h5">
                  xs — Label heading
                </Title>
              </div>
            </VariantBlock>

            <VariantBlock label="color" bg="bg-gray-950">
              <Title as="h2" size="lg" color="white">
                white
              </Title>
              <Title as="h2" size="lg" color="muted">
                muted
              </Title>
              <Title as="h2" size="lg" color="accent">
                accent
              </Title>
            </VariantBlock>

            <VariantBlock label="weight">
              <Title as="h2" size="md" color="black" weight="normal">
                normal — Heading liviano
              </Title>
              <Title as="h2" size="md" color="black" weight="bold">
                bold — Heading fuerte
              </Title>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Card ──────────────────────────────────────────────── */}
        <Section
          title="Card"
          description="Contenedor estructurado con Header, Title, Description, Content y Footer."
        >
          <Grid>
            <VariantBlock label="estructura completa">
              <Card className="w-80">
                <CardHeader>
                  <CardTitle>Título de la card</CardTitle>
                  <CardDescription>
                    Descripción secundaria con información de soporte.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichText>
                    Contenido principal del card. Puede contener cualquier
                    elemento.
                  </RichText>
                </CardContent>
                <CardFooter className="gap-2">
                  <button className="text-xs font-medium bg-black text-white px-3 py-1.5 rounded">
                    Acción primaria
                  </button>
                  <button className="text-xs font-medium border border-gray-200 px-3 py-1.5 rounded">
                    Cancelar
                  </button>
                </CardFooter>
              </Card>
            </VariantBlock>

            <VariantBlock label="sin footer">
              <Card className="w-72">
                <CardHeader>
                  <CardTitle>Solo header</CardTitle>
                  <CardDescription>Sin footer, solo contenido.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichText as="p" size="xs" color="black">
                    Útil para cards informativas sin acciones.
                  </RichText>
                </CardContent>
              </Card>
            </VariantBlock>

            <VariantBlock label="color en CardTitle y CardDescription">
              <Card className="w-72 bg-gray-950">
                <CardHeader>
                  <CardTitle color="white">Título blanco</CardTitle>
                  <CardDescription color="muted">
                    Descripción atenuada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichText as="p" size="xs" color="muted">
                    Contenido sobre fondo oscuro.
                  </RichText>
                </CardContent>
              </Card>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Hero ──────────────────────────────────────────────── */}
        <Section
          title="Hero"
          description="Sección hero composable. Layouts: centered, split, split-reverse, fullscreen. Backgrounds: none, muted, primary, dark."
        >
          <Grid>
            {/* background=none */}
            <VariantBlock label="layout=centered / background=none">
              <HeroSection
                layout="centered"
                background="none"
                className="border border-gray-100 rounded-xl"
              >
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título principal</HeroTitle>
                  <HeroDescription>
                    Descripción de soporte. Explica el valor o propósito de la
                    sección.
                  </HeroDescription>
                  <HeroActions
                    primaryLabel="Primario"
                    secondaryLabel="Secundario"
                  />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* background=muted */}
            <VariantBlock label="layout=centered / background=muted">
              <HeroSection
                layout="centered"
                background="muted"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre muted</HeroTitle>
                  <HeroDescription>
                    Background muted con colores de texto resueltos
                    automáticamente.
                  </HeroDescription>
                  <HeroActions
                    primaryLabel="Primario"
                    secondaryLabel="Secundario"
                  />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* background=primary */}
            <VariantBlock label="layout=centered / background=primary">
              <HeroSection
                layout="centered"
                background="primary"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre primary</HeroTitle>
                  <HeroDescription>
                    El eyebrow toma color accent, título y descripción se
                    adaptan al fondo.
                  </HeroDescription>
                  <HeroActions
                    primaryLabel="Primario"
                    secondaryLabel="Secundario"
                  />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* background=dark */}
            <VariantBlock label="layout=centered / background=dark">
              <HeroSection
                layout="centered"
                background="dark"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre dark</HeroTitle>
                  <HeroDescription>
                    Los colores se resuelven automáticamente según el
                    background.
                  </HeroDescription>
                  <HeroActions
                    primaryLabel="Primario"
                    secondaryLabel="Secundario"
                  />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* layout=split */}
            <VariantBlock label="layout=split / background=primary">
              <HeroSection
                layout="split"
                background="primary"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow>Split layout</HeroEyebrow>
                  <HeroSubTitle>Subtítulo en split</HeroSubTitle>
                  <HeroDescription>
                    Contenido a la izquierda con media a la derecha.
                  </HeroDescription>
                  <HeroActions primaryLabel="Acción" secondaryLabel="Ver más" />
                </HeroContent>
                <HeroMedia>
                  <div className="w-full aspect-video bg-white/10 rounded-lg flex items-center justify-center">
                    <RichText as="span" size="xs" color="muted">
                      Media slot
                    </RichText>
                  </div>
                </HeroMedia>
              </HeroSection>
            </VariantBlock>

            {/* layout=split-reverse */}
            <VariantBlock label="layout=split-reverse / background=dark">
              <HeroSection
                layout="split-reverse"
                background="dark"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow>Split reverse</HeroEyebrow>
                  <HeroSubTitle>Media a la izquierda</HeroSubTitle>
                  <HeroDescription>
                    El contenido y la media se invierten. Útil para alternar
                    secciones.
                  </HeroDescription>
                  <HeroActions
                    primaryLabel="Acción"
                    primaryHref="/demo"
                    secondaryLabel="Documentación"
                    secondaryHref="/docs"
                  />
                </HeroContent>
                <HeroMedia>
                  <div className="w-full aspect-video bg-white/10 rounded-lg flex items-center justify-center">
                    <RichText as="span" size="xs" color="muted">
                      Media slot
                    </RichText>
                  </div>
                </HeroMedia>
              </HeroSection>
            </VariantBlock>

            {/* HeroBadge */}
            <VariantBlock label="HeroBadge — antes del título">
              <HeroSection
                layout="centered"
                background="none"
                className="border border-gray-100 rounded-xl py-10"
              >
                <HeroContent>
                  <div>
                    <HeroBadge className="mb-4">Nuevo · v2.0</HeroBadge>
                  </div>
                  <HeroTitle>Con badge decorativo</HeroTitle>
                  <HeroDescription className="mx-auto">
                    El badge se posiciona antes del título para destacar
                    novedades.
                  </HeroDescription>
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* color override */}
            <VariantBlock label="color override manual — ignora el contexto">
              <HeroSection
                layout="centered"
                background="dark"
                className="rounded-xl w-full"
              >
                <HeroContent>
                  <HeroEyebrow color="white">
                    Eyebrow forzado a white
                  </HeroEyebrow>
                  <HeroTitle color="accent">Título forzado a accent</HeroTitle>
                  <HeroDescription color="white" className="mx-auto">
                    Descripción forzada a white. Cada subcomponente acepta color
                    como prop para anular la resolución automática del contexto.
                  </HeroDescription>
                  <HeroActions className="mx-auto" primaryLabel="Acción" secondaryLabel="Ver más" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* HeroActions slot children */}
            <VariantBlock label="HeroActions — slot children libre">
              <HeroSection
                layout="centered"
                background="none"
                className="border border-gray-100 rounded-xl py-10"
              >
                <HeroContent>
                  <HeroTitle>Acciones personalizadas</HeroTitle>
                  <HeroDescription className="mx-auto">
                    El slot children de HeroActions permite insertar cualquier
                    elemento adicional junto a los botones declarativos.
                  </HeroDescription>
                  <HeroActions
                    className="mx-auto"
                    primaryLabel="Primario"
                    secondaryLabel="Secundario"
                  >
                    <RichText
                      as="span"
                      size="xs"
                      color="black"
                      className="self-center"
                    >
                      o contactanos
                    </RichText>
                  </HeroActions>
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            {/* HeroActions con href */}
            <VariantBlock label="HeroActions — navegación con href">
              <HeroSection
                layout="centered"
                background="none"
                className="border border-gray-100 rounded-xl py-10"
              >
                <HeroContent className="gap-10">
                  <HeroTitle>Botones como links</HeroTitle>
                  <HeroDescription className="mx-auto">
                    Cuando se pasa primaryHref o secondaryHref, los botones
                    renderizan como anchors en lugar de botones. Ideal para CTAs
                    de navegación.
                  </HeroDescription>
                  <HeroActions
                    className="mx-auto"
                    primaryLabel="Ir al dashboard"
                    primaryHref="/dashboard"
                    secondaryLabel="Ver documentación"
                    secondaryHref="/docs"
                  />
                </HeroContent>
              </HeroSection>
            </VariantBlock>
          </Grid>
        </Section>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-8 py-8 max-w-6xl mx-auto">
        <RichText as="p" size="xs" color="muted" className="text-gray-400">
          Design System · Primitivos — actualizado automáticamente con cada
          cambio en los componentes.
        </RichText>
      </div>
    </main>
  );
}
