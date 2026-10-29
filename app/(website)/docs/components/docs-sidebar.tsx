"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOCS_NAV } from "../nav-config";

function NavList() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {DOCS_NAV.map((section) => (
        <div key={section.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-ey-turquoise/10 font-medium text-ey-turquoise-dark"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsSidebar() {
  return (
    <>
      {/* Mobile: índice colapsable arriba del contenido */}
      <details className="mb-6 rounded-lg border border-border md:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
          Índice de la documentación
        </summary>
        <div className="border-t border-border px-4 py-4">
          <NavList />
        </div>
      </details>

      {/* Desktop: columna fija a la izquierda */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-24 pr-4">
          <NavList />
        </div>
      </aside>
    </>
  );
}
