"use client";
import Link from "next/link";
import { Home } from "lucide-react";
import { Session } from "next-auth";
import { menuData } from "../../data/menuData";
import { NavDropdown } from "./nav-dropdown";

export default function DashboardNavigation({ session }: { session: Session }) {
  const filteredMenuData = menuData.filter(
    (section) =>
      !(session.user.role === "SELLER" && section.title === "Cuentas"),
  );

  return (
    <nav className="flex items-center gap-1">
      {filteredMenuData.map((section) =>
        section.items ? (
          <NavDropdown
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ) : (
          <Link
            key={section.title}
            href={section.href ?? "#"}
            className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors inline-flex items-center"
          >
            {section.href === "/dashboard" ? (
              <Home className="h-4 w-4" />
            ) : (
              section.title
            )}
          </Link>
        ),
      )}
    </nav>
  );
}
