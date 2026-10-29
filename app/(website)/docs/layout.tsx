import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { DocsSidebar } from "./components/docs-sidebar";

export const metadata: Metadata = {
  title: `Documentación | ${SITE_NAME}`,
  description:
    "Guías para usar EyTickets: crear y administrar eventos, tipos de entrada, pagos y más.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-nebulica">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container flex h-16 items-center gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-bold tracking-tight text-foreground"
          >
            Ey<span className="text-ey-turquoise-dark">Tickets</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Documentación
          </span>
          <Link
            href="/dashboard"
            className="ml-auto text-sm font-medium text-foreground/80 transition-colors hover:text-ey-turquoise-dark"
          >
            Ir al dashboard
          </Link>
        </div>
      </header>

      <div className="container flex flex-col gap-6 py-8 md:flex-row md:gap-10">
        <DocsSidebar />
        <main className="min-w-0 flex-1 pb-20">{children}</main>
      </div>
    </div>
  );
}
