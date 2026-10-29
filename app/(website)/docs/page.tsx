import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { DocsPageHeader } from "./components/docs-ui";

export const metadata: Metadata = {
  title: "Documentación | EyTickets",
};

export default function DocsHomePage() {
  return (
    <>
      <DocsPageHeader
        title="Documentación de EyTickets"
        description="Guías paso a paso para administrar tus eventos, entradas y pagos desde el dashboard."
      />

      <Link
        href="/docs/eventos"
        className="group flex items-center gap-4 rounded-lg border border-border p-5 transition-colors hover:border-ey-turquoise-dark"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ey-turquoise/10 text-ey-turquoise-dark">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Eventos</p>
          <p className="text-sm text-muted-foreground">
            Crear, editar y administrar eventos, tipos de entrada y stock.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>
    </>
  );
}
