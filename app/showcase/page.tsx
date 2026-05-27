"use client";
import * as React from "react";
import { RichText } from "@/components/website/ui/RichText";
import { Title } from "@/components/website/ui/Title";
import { Paragraph } from "@/components/website/ui/Paragraph";
import { Button } from "@/components/website/ui/Button";
import { Input } from "@/components/website/ui/Input";
import { Textarea } from "@/components/website/ui/TextArea";
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

        {/* ─── RichText ──────────────────────────────────────────── */}
        <Section
          title="RichText"
          description="Componente base para texto corrido. Soporta p, span, strong, em y label."
        >
          <Grid>
            <VariantBlock label="size">
              <RichText as="p" size="xs" color="black">xs — Texto pequeño</RichText>
              <RichText as="p" size="sm" color="black">sm — Texto base</RichText>
              <RichText as="p" size="md" color="black">md — Texto medio</RichText>
            </VariantBlock>

            <VariantBlock label="color" bg="bg-gray-950">
              <RichText as="p" color="white">white</RichText>
              <RichText as="p" color="muted">muted</RichText>
              <RichText as="p" color="accent" className="bg-white px-2 rounded">accent</RichText>
              <RichText as="p" color="black" className="bg-white px-2 rounded">black</RichText>
            </VariantBlock>

            <VariantBlock label="weight">
              <RichText as="p" color="black" weight="normal">normal — The quick brown fox</RichText>
              <RichText as="p" color="black" weight="bold">bold — The quick brown fox</RichText>
            </VariantBlock>

            <VariantBlock label="as — tags semánticos">
              <RichText as="p" color="black">as=&quot;p&quot; — párrafo</RichText>
              <RichText as="span" color="black">as=&quot;span&quot; — inline</RichText>
              <RichText as="strong" color="black" weight="bold">as=&quot;strong&quot; — énfasis fuerte</RichText>
              <RichText as="em" color="black">as=&quot;em&quot; — énfasis</RichText>
            </VariantBlock>

            <VariantBlock label='as="label" — accesible con htmlFor'>
              <div className="flex flex-col gap-1">
                <RichText as="label" htmlFor="demo-input" color="black" size="xs" weight="bold">
                  Email
                </RichText>
                <Input
                  id="demo-input"
                  type="email"
                  placeholder="hola@empresa.com"
                />
              </div>
            </VariantBlock>

            <VariantBlock label="composición — strong dinámico">
              <RichText as="p" color="black">
                El usuario{" "}
                <RichText as="strong" color="black" weight="bold">Juan Pérez</RichText>
                {" "}inició sesión correctamente.
              </RichText>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Paragraph ─────────────────────────────────────────── */}
        <Section
          title="Paragraph"
          description="Variante semántica de RichText restringida a etiqueta p. Mismas variantes de size, color y weight."
        >
          <Grid>
            <VariantBlock label="size">
              <Paragraph size="xs" color="black">xs — Texto pequeño</Paragraph>
              <Paragraph size="sm" color="black">sm — Texto base</Paragraph>
              <Paragraph size="md" color="black">md — Texto medio</Paragraph>
            </VariantBlock>

            <VariantBlock label="color" bg="bg-gray-950">
              <Paragraph color="white">white</Paragraph>
              <Paragraph color="muted">muted</Paragraph>
              <Paragraph color="accent" className="bg-white px-2 rounded">accent</Paragraph>
            </VariantBlock>

            <VariantBlock label="weight">
              <Paragraph color="black" weight="normal">normal — The quick brown fox</Paragraph>
              <Paragraph color="black" weight="bold">bold — The quick brown fox</Paragraph>
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
                <Title as="h1" size="xl" color="black">xl — Display grande</Title>
                <Title as="h2" size="lg" color="black">lg — Display medio</Title>
                <Title as="h3" size="md" color="black">md — Heading sección</Title>
                <Title as="h4" size="sm" color="black">sm — Subheading</Title>
                <Title as="h5" size="xs" color="black">xs — Label heading</Title>
              </div>
            </VariantBlock>

            <VariantBlock label="color" bg="bg-gray-950">
              <Title as="h2" size="lg" color="white">white</Title>
              <Title as="h2" size="lg" color="muted">muted</Title>
              <Title as="h2" size="lg" color="accent">accent</Title>
            </VariantBlock>

            <VariantBlock label="weight">
              <Title as="h2" size="md" color="black" weight="normal">normal — Heading liviano</Title>
              <Title as="h2" size="md" color="black" weight="bold">bold — Heading fuerte</Title>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Button ────────────────────────────────────────────── */}
        <Section
          title="Button"
          description="Botón polimórfico. Renderiza como button o como Link de Next.js según la presencia de href."
        >
          <Grid>
            <VariantBlock label="variant">
              <Button variant="primary">primary</Button>
              <Button variant="secondary">secondary</Button>
              <Button variant="ghost">ghost</Button>
              <Button variant="outline">outline</Button>
              <Button variant="link">link</Button>
            </VariantBlock>

            <VariantBlock label="size">
              <Button variant="primary" size="sm">sm</Button>
              <Button variant="primary" size="md">md</Button>
              <Button variant="primary" size="lg">lg</Button>
            </VariantBlock>

            <VariantBlock label="como link — con href">
              <Button variant="primary" href="/dashboard">Ir al dashboard</Button>
              <Button variant="outline" href="/docs">Ver documentación</Button>
            </VariantBlock>

            <VariantBlock label="variant × size — matriz">
              {(["primary", "secondary", "outline", "ghost"] as const).map((v) =>
                (["sm", "md", "lg"] as const).map((s) => (
                  <Button key={`${v}-${s}`} variant={v} size={s}>
                    {v} {s}
                  </Button>
                ))
              )}
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Input ─────────────────────────────────────────────── */}
        <Section
          title="Input"
          description="Campo de texto con variantes de size, color y estado de borde."
        >
          <Grid>
            <VariantBlock label="default">
              <Input placeholder="Texto de placeholder" className="max-w-xs" />
            </VariantBlock>

            <VariantBlock label="border — estado de error">
              <div className="flex flex-col gap-1 w-full max-w-xs">
                <Input border="error" placeholder="Email inválido" />
                <RichText as="p" size="xs" color="black" className="text-red-500">
                  Este campo es requerido.
                </RichText>
              </div>
            </VariantBlock>

            <VariantBlock label="size">
              <Input size="xs" placeholder="xs — input pequeño" className="max-w-xs" />
              <Input size="sm" placeholder="sm — input base" className="max-w-xs" />
              <Input size="md" placeholder="md — input medio" className="max-w-xs" />
            </VariantBlock>

            <VariantBlock label="tipos nativos — type">
              <Input type="email" placeholder="hola@empresa.com" className="max-w-xs" />
              <Input type="password" placeholder="Contraseña" className="max-w-xs" />
              <Input type="number" placeholder="42" className="max-w-xs" />
            </VariantBlock>

            <VariantBlock label='con label — accesible via RichText as="label"'>
              <div className="flex flex-col gap-1 w-full max-w-xs">
                <RichText as="label" htmlFor="input-email" color="black" size="xs" weight="bold">
                  Email
                </RichText>
                <Input id="input-email" type="email" placeholder="hola@empresa.com" />
              </div>
            </VariantBlock>
          </Grid>
        </Section>

        {/* ─── Textarea ──────────────────────────────────────────── */}
        <Section
          title="Textarea"
          description="Área de texto multilinea. Comparte variantes de size, color y border con Input."
        >
          <Grid>
            <VariantBlock label="default">
              <Textarea placeholder="Escribí tu mensaje acá..." className="max-w-sm" />
            </VariantBlock>

            <VariantBlock label="border — estado de error">
              <div className="flex flex-col gap-1 w-full max-w-sm">
                <Textarea border="error" placeholder="Este campo tiene un error" />
                <RichText as="p" size="xs" color="black" className="text-red-500">
                  El mensaje no puede estar vacío.
                </RichText>
              </div>
            </VariantBlock>

            <VariantBlock label='con label — accesible via RichText as="label"'>
              <div className="flex flex-col gap-1 w-full max-w-sm">
                <RichText as="label" htmlFor="textarea-msg" color="black" size="xs" weight="bold">
                  Mensaje
                </RichText>
                <Textarea id="textarea-msg" placeholder="Describí tu consulta..." />
              </div>
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
                  <Paragraph size="sm" color="black">
                    Contenido principal del card. Puede contener cualquier elemento.
                  </Paragraph>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button variant="primary" size="sm">Acción primaria</Button>
                  <Button variant="outline" size="sm">Cancelar</Button>
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
                  <Paragraph size="xs" color="black">
                    Útil para cards informativas sin acciones.
                  </Paragraph>
                </CardContent>
              </Card>
            </VariantBlock>

            <VariantBlock label="color en CardTitle y CardDescription" bg="bg-gray-950">
              <Card className="w-72 bg-gray-950">
                <CardHeader>
                  <CardTitle color="white">Título blanco</CardTitle>
                  <CardDescription color="muted">Descripción atenuada</CardDescription>
                </CardHeader>
                <CardContent>
                  <Paragraph size="xs" color="muted">
                    Contenido sobre fondo oscuro.
                  </Paragraph>
                </CardContent>
              </Card>
            </VariantBlock>

            <VariantBlock label="con formulario en CardContent">
              <Card className="w-80">
                <CardHeader>
                  <CardTitle>Iniciar sesión</CardTitle>
                  <CardDescription>Ingresá tus credenciales para continuar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <RichText as="label" htmlFor="card-email" color="black" size="xs" weight="bold">
                      Email
                    </RichText>
                    <Input id="card-email" type="email" placeholder="hola@empresa.com" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <RichText as="label" htmlFor="card-pass" color="black" size="xs" weight="bold">
                      Contraseña
                    </RichText>
                    <Input id="card-pass" type="password" placeholder="••••••••" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" className="w-full">Ingresar</Button>
                </CardFooter>
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
            <VariantBlock label="layout=centered / background=none">
              <HeroSection layout="centered" background="none" className="border border-gray-100 rounded-xl">
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título principal</HeroTitle>
                  <HeroDescription>
                    Descripción de soporte. Explica el valor o propósito de la sección.
                  </HeroDescription>
                  <HeroActions primaryLabel="Primario" secondaryLabel="Secundario" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="layout=centered / background=muted">
              <HeroSection layout="centered" background="muted" className="rounded-xl w-full">
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre muted</HeroTitle>
                  <HeroDescription>
                    Background muted con colores de texto resueltos automáticamente.
                  </HeroDescription>
                  <HeroActions primaryLabel="Primario" secondaryLabel="Secundario" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="layout=centered / background=primary">
              <HeroSection layout="centered" background="primary" className="rounded-xl w-full">
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre primary</HeroTitle>
                  <HeroDescription>
                    El eyebrow toma color accent, título y descripción se adaptan al fondo.
                  </HeroDescription>
                  <HeroActions primaryLabel="Primario" secondaryLabel="Secundario" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="layout=centered / background=dark">
              <HeroSection layout="centered" background="dark" className="rounded-xl w-full">
                <HeroContent>
                  <HeroEyebrow>Eyebrow label</HeroEyebrow>
                  <HeroTitle>Título sobre dark</HeroTitle>
                  <HeroDescription>
                    Los colores se resuelven automáticamente según el background.
                  </HeroDescription>
                  <HeroActions primaryLabel="Primario" secondaryLabel="Secundario" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="layout=split / background=primary">
              <HeroSection layout="split" background="primary" className="rounded-xl w-full">
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
                    <RichText as="span" size="xs" color="muted">Media slot</RichText>
                  </div>
                </HeroMedia>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="layout=split-reverse / background=dark">
              <HeroSection layout="split-reverse" background="dark" className="rounded-xl w-full">
                <HeroContent>
                  <HeroEyebrow>Split reverse</HeroEyebrow>
                  <HeroSubTitle>Media a la izquierda</HeroSubTitle>
                  <HeroDescription>
                    El contenido y la media se invierten. Útil para alternar secciones.
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
                    <RichText as="span" size="xs" color="muted">Media slot</RichText>
                  </div>
                </HeroMedia>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="HeroBadge — antes del título">
              <HeroSection layout="centered" background="none" className="border border-gray-100 rounded-xl py-10">
                <HeroContent>
                  <div>
                    <HeroBadge className="mb-4">Nuevo · v2.0</HeroBadge>
                  </div>
                  <HeroTitle>Con badge decorativo</HeroTitle>
                  <HeroDescription className="mx-auto">
                    El badge se posiciona antes del título para destacar novedades.
                  </HeroDescription>
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="color override manual — ignora el contexto">
              <HeroSection layout="centered" background="dark" className="rounded-xl w-full">
                <HeroContent>
                  <HeroEyebrow color="white">Eyebrow forzado a white</HeroEyebrow>
                  <HeroTitle color="accent">Título forzado a accent</HeroTitle>
                  <HeroDescription color="white" className="mx-auto">
                    Cada subcomponente acepta color como prop para anular la resolución automática del contexto.
                  </HeroDescription>
                  <HeroActions className="mx-auto" primaryLabel="Acción" secondaryLabel="Ver más" />
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="HeroActions — slot children libre">
              <HeroSection layout="centered" background="none" className="border border-gray-100 rounded-xl py-10">
                <HeroContent>
                  <HeroTitle>Acciones personalizadas</HeroTitle>
                  <HeroDescription className="mx-auto">
                    El slot children de HeroActions permite insertar cualquier elemento adicional.
                  </HeroDescription>
                  <HeroActions className="mx-auto" primaryLabel="Primario" secondaryLabel="Secundario">
                    <RichText as="span" size="xs" color="black" className="self-center">
                      o contactanos
                    </RichText>
                  </HeroActions>
                </HeroContent>
              </HeroSection>
            </VariantBlock>

            <VariantBlock label="HeroActions — navegación con href">
              <HeroSection layout="centered" background="none" className="border border-gray-100 rounded-xl py-10">
                <HeroContent className="gap-10">
                  <HeroTitle>Botones como links</HeroTitle>
                  <HeroDescription className="mx-auto">
                    Cuando se pasa primaryHref o secondaryHref, los botones renderizan como anchors.
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
        <Paragraph size="xs" color="black" className="text-gray-400">
          Design System · Primitivos — actualizado automáticamente con cada cambio en los componentes.
        </Paragraph>
      </div>
    </main>
  );
}