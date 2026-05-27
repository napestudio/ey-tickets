# Componentes — Design System

Referencia técnica de todos los componentes primitivos. Para la referencia visual, ver la página `/showcase`.

---

## Índice

- [RichText](#richtext)
- [Paragraph](#paragraph)
- [Title](#title)
- [Button](#button)
- [Input](#input)
- [Textarea](#textarea)
- [Card](#card)

---

## Sistema de tokens

Todas las variantes de tipografía y color provienen de `tokens.ts`. Los componentes no definen clases directamente — las toman de los tokens vía CVA.

| Token | Valores | Usado en |
|---|---|---|
| `textSizeTokens` | `xs` `sm` `md` | RichText, Paragraph |
| `titleSizeTokens` | `xs` `sm` `md` `lg` `xl` | Title |
| `colorTokens` | `white` `muted` `accent` `black` | Todos los de tipografía |
| `weightTokens` | `normal` `bold` | Todos los de tipografía |
| `buttonVariantTokens` | `primary` `secondary` `ghost` `outline` `link` | Button |
| `buttonSizeTokens` | `sm` `md` `lg` | Button |
| `borderStateTokens` | `default` `error` | Input, Textarea |

> Agregar un valor nuevo a un token lo expone automáticamente en todos los componentes que lo usan. Ver [TESTING.md](./TESTING.md) para la convención de tests al agregar tokens.

---

## RichText

Componente base para texto corrido. Renderiza cualquier tag inline o de bloque semántico.

```typescript
import { RichText } from "@/components/website/ui/Text";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `as` | `"p" \| "span" \| "strong" \| "em" \| "label"` | `"p"` | Tag HTML a renderizar |
| `size` | `"xs" \| "sm" \| "md"` | `"sm"` | Tamaño tipográfico |
| `color` | `"white" \| "muted" \| "accent" \| "black"` | `"black"` | Color del texto |
| `weight` | `"normal" \| "bold"` | `"normal"` | Peso tipográfico |
| `htmlFor` | `string` | — | Requerido cuando `as="label"` |
| `className` | `string` | — | Clases adicionales |

Acepta todos los atributos HTML nativos del tag correspondiente.

### Uso

```tsx
// Párrafo base
<RichText>Texto por defecto</RichText>

// Span inline
<RichText as="span" size="xs" color="muted">Detalle</RichText>

// Label accesible — htmlFor es requerido
<RichText as="label" htmlFor="mi-input" size="xs" weight="bold" color="black">
  Email
</RichText>

// Composición con strong
<RichText as="p" color="black">
  El usuario <RichText as="strong" weight="bold">Juan</RichText> inició sesión.
</RichText>
```

### Cuándo usar RichText vs Paragraph

Usar `RichText` cuando necesitás cambiar el tag (`span`, `strong`, `label`) o componer elementos inline. Usar `Paragraph` cuando el elemento siempre es un `<p>` — es más restrictivo y más explícito.

---

## Paragraph

Variante semántica de `RichText` restringida al tag `<p>`. No acepta prop `as`.

```typescript
import { Paragraph } from "@/components/website/ui/Paragraph";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `"xs" \| "sm" \| "md"` | `"sm"` | Tamaño tipográfico |
| `color` | `"white" \| "muted" \| "accent" \| "black"` | `"black"` | Color del texto |
| `weight` | `"normal" \| "bold"` | `"normal"` | Peso tipográfico |
| `className` | `string` | — | Clases adicionales |

Acepta todos los atributos nativos de `<p>`.

### Uso

```tsx
<Paragraph size="sm" color="black">
  Texto de párrafo estándar.
</Paragraph>

<Paragraph size="xs" color="muted">
  Nota al pie o texto secundario.
</Paragraph>
```

---

## Title

Headings semánticos con escala tipográfica extendida (`xs`–`xl`). Soporta `h1`–`h6`.

```typescript
import { Title } from "@/components/website/ui/Title";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `as` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h2"` | Tag de heading |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"lg"` | Tamaño tipográfico |
| `color` | `"white" \| "muted" \| "accent" \| "black"` | `"black"` | Color del texto |
| `weight` | `"normal" \| "bold"` | `"normal"` | Peso tipográfico |
| `className` | `string` | — | Clases adicionales |

Acepta todos los atributos nativos de `HTMLHeadingElement`.

### Uso

```tsx
// Heading de página
<Title as="h1" size="xl" weight="bold" color="black">
  Título principal
</Title>

// Heading de sección
<Title as="h2" size="md" color="black">
  Sección
</Title>

// Sobre fondo oscuro
<Title as="h2" size="lg" color="white">
  Título claro
</Title>
```

> **Nota:** `as` y `size` son independientes. Se puede tener `<h1>` con `size="xs"` si el contexto lo requiere — la jerarquía semántica y la visual son decisiones separadas.

---

## Button

Botón polimórfico. Renderiza como `<button>` nativo o como `<Link>` de Next.js según la presencia de `href`.

```typescript
import { Button } from "@/components/website/ui/Button";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "outline" \| "link"` | `"primary"` | Estilo visual |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tamaño |
| `href` | `string` | — | Si se pasa, renderiza como `<Link>` |
| `className` | `string` | — | Clases adicionales |
| `children` | `ReactNode` | — | Contenido del botón |

Sin `href`: acepta todos los atributos de `<button>` (`onClick`, `disabled`, `type`, etc.).
Con `href`: acepta todos los atributos de `<a>` (`target`, `rel`, etc.).

### Uso

```tsx
// Botón nativo
<Button variant="primary" onClick={handleSubmit}>
  Guardar
</Button>

// Botón deshabilitado
<Button variant="primary" disabled>
  Procesando...
</Button>

// Submit en formulario
<Button type="submit" variant="primary">
  Enviar
</Button>

// Link de navegación
<Button variant="outline" href="/dashboard">
  Ir al dashboard
</Button>

// Link externo
<Button variant="link" href="https://docs.empresa.com" target="_blank" rel="noopener">
  Documentación
</Button>
```

### Variantes visuales

| Variante | Cuándo usar |
|---|---|
| `primary` | Acción principal de la pantalla |
| `secondary` | Acción secundaria, sobre fondos oscuros |
| `outline` | Acción alternativa, sobre fondos claros |
| `ghost` | Acción terciaria, sin borde visible |
| `link` | Navegación inline dentro de texto |

---

## Input

Campo de texto de una línea con soporte para estados de validación.

```typescript
import { Input } from "@/components/website/ui/Input";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `"xs" \| "sm" \| "md"` | `"sm"` | Tamaño tipográfico |
| `color` | `"white" \| "muted" \| "accent" \| "black"` | `"black"` | Color del texto |
| `border` | `"default" \| "error"` | `"default"` | Estado del borde |
| `className` | `string` | — | Clases adicionales |

Acepta todos los atributos nativos de `<input>` (`type`, `placeholder`, `disabled`, `id`, `value`, `onChange`, etc.) excepto `color`, `size`, y `border` que están redefinidos por CVA.

### Uso

```tsx
// Input básico
<Input type="email" placeholder="hola@empresa.com" />

// Con label accesible
<div className="flex flex-col gap-1">
  <RichText as="label" htmlFor="email" size="xs" weight="bold" color="black">
    Email
  </RichText>
  <Input id="email" type="email" placeholder="hola@empresa.com" />
</div>

// Estado de error
<div className="flex flex-col gap-1">
  <Input border="error" aria-invalid="true" aria-describedby="email-error" />
  <RichText as="p" size="xs" className="text-red-500" id="email-error">
    Este campo es requerido.
  </RichText>
</div>
```

### Estado de error accesible

Siempre acompañar `border="error"` con `aria-invalid="true"` y un mensaje de error asociado via `aria-describedby`.

---

## Textarea

Área de texto multilinea. Comparte el sistema de variantes con `Input`.

```typescript
import { Textarea } from "@/components/website/ui/TextArea";
```

### Props

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `"xs" \| "sm" \| "md"` | `"sm"` | Tamaño tipográfico |
| `color` | `"white" \| "muted" \| "accent" \| "black"` | `"black"` | Color del texto |
| `border` | `"default" \| "error"` | `"default"` | Estado del borde |
| `className` | `string` | — | Clases adicionales |

Acepta todos los atributos nativos de `<textarea>` (`rows`, `placeholder`, `disabled`, `id`, `onChange`, etc.).

### Uso

```tsx
// Textarea básico
<Textarea placeholder="Describí tu consulta..." rows={4} />

// Con label accesible
<div className="flex flex-col gap-1">
  <RichText as="label" htmlFor="mensaje" size="xs" weight="bold" color="black">
    Mensaje
  </RichText>
  <Textarea id="mensaje" placeholder="Escribí acá..." />
</div>

// Estado de error
<Textarea border="error" aria-invalid="true" />
```

---

## Card

Contenedor estructurado con subcomponentes para `Header`, `Title`, `Description`, `Content` y `Footer`.

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/website/ui/Card";
```

### Subcomponentes

| Componente | Props extra | Descripción |
|---|---|---|
| `Card` | — | Contenedor raíz con borde y border-radius |
| `CardHeader` | — | Sección superior con padding y gap vertical |
| `CardTitle` | `color?: TextColor` | Heading de la card, default `h3 md bold` |
| `CardDescription` | `color?: TextColor` | Texto de soporte, default `muted` |
| `CardContent` | — | Área de contenido principal |
| `CardFooter` | — | Sección inferior, flex row |

Todos los subcomponentes aceptan `className` y los atributos HTML nativos del elemento que renderizan.

### Uso

```tsx
// Card completa
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción de soporte.</CardDescription>
  </CardHeader>
  <CardContent>
    <Paragraph size="sm" color="black">Contenido principal.</Paragraph>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="primary" size="sm">Confirmar</Button>
    <Button variant="outline" size="sm">Cancelar</Button>
  </CardFooter>
</Card>

// Card sobre fondo oscuro
<Card className="bg-gray-950">
  <CardHeader>
    <CardTitle color="white">Título claro</CardTitle>
    <CardDescription color="muted">Descripción atenuada.</CardDescription>
  </CardHeader>
  <CardContent>
    <Paragraph size="sm" color="muted">Contenido sobre oscuro.</Paragraph>
  </CardContent>
</Card>

// Card con formulario
<Card>
  <CardHeader>
    <CardTitle>Iniciar sesión</CardTitle>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <RichText as="label" htmlFor="email" size="xs" weight="bold" color="black">
        Email
      </RichText>
      <Input id="email" type="email" placeholder="hola@empresa.com" />
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="primary" className="w-full">Ingresar</Button>
  </CardFooter>
</Card>
```
