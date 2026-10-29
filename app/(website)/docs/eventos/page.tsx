import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPageHeader } from "../components/docs-ui";

export const metadata: Metadata = {
  title: "Eventos | Documentación | EyTickets",
};

const GUIDES: { title: string; description: string; href: string; ready: boolean }[] = [
  {
    title: "Crear un evento",
    description: "Completá los 6 pasos del asistente de creación de eventos.",
    href: "/docs/eventos/crear",
    ready: true,
  },
  {
    title: "Editar un evento",
    description: "Modificá datos, fechas y lugar de un evento ya creado.",
    href: "/docs/eventos/editar",
    ready: false,
  },
  {
    title: "Eliminar un evento",
    description: "Qué pasa con las entradas vendidas al eliminar un evento.",
    href: "/docs/eventos/eliminar",
    ready: false,
  },
  {
    title: "Crear tipos de entrada",
    description: "Definí los tipos de ticket que se pueden vender para un evento.",
    href: "/docs/eventos/tipos-de-entrada",
    ready: false,
  },
  {
    title: "Asignar y ajustar stock de entradas",
    description: "Sumá o restá unidades disponibles de un tipo de entrada.",
    href: "/docs/eventos/asignar-entradas",
    ready: false,
  },
];

export default function EventosDocsIndexPage() {
  return (
    <>
      <DocsPageHeader
        title="Eventos"
        description="Todo lo relacionado a la creación y administración de eventos."
      />

      <div className="space-y-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:border-ey-turquoise-dark"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{guide.title}</p>
                {!guide.ready && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Próximamente
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{guide.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </>
  );
}
