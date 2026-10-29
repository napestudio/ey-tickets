import Image from "next/image";
import { Clock, ImageIcon, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DocsPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 space-y-2 border-b border-border pb-6">
      <h1 className="font-nebulica text-2xl font-bold text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function GuideStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ey-turquoise/10 text-sm font-bold text-ey-turquoise-dark">
        {number}
      </div>
      <div className="flex-1 space-y-3 pb-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="space-y-3 text-sm text-muted-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 text-center text-xs text-muted-foreground">
      <ImageIcon className="h-5 w-5" />
      <span>Captura pendiente — {label}</span>
    </div>
  );
}

export function GuideScreenshot({
  src,
  width,
  height,
  alt,
  fit = "full",
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** "full" stretches to the content column (full-page captures); "natural" keeps the crop's own size (tight element crops). */
  fit?: "full" | "natural";
}) {
  return (
    <div
      className={
        fit === "full"
          ? "overflow-hidden rounded-lg border border-border"
          : "inline-block overflow-hidden rounded-lg border border-border"
      }
    >
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        className={fit === "full" ? "h-auto w-full" : "block"}
      />
    </div>
  );
}

export function DocsNote({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function ComingSoonNotice({ feature }: { feature: string }) {
  return (
    <Alert>
      <Clock className="h-4 w-4" />
      <AlertTitle>Guía en construcción</AlertTitle>
      <AlertDescription>
        Todavía no escribimos la guía de &quot;{feature}&quot;. Esta sección
        ya aparece en el índice para que la navegación quede completa, pero el
        contenido se agrega en una próxima iteración.
      </AlertDescription>
    </Alert>
  );
}
