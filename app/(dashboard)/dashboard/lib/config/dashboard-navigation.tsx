import { AppRole } from "@/types/user";
import { getPermissions, JwtUser, Permission } from "@/lib/route-permissions";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
}

// Todos los items posibles de navegación, en orden de display.
// Cada uno requiere un permiso específico para ser visible.
const ALL_NAV_ITEMS: Array<NavItem & { requires: Permission }> = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: "dashboard",
    requires: "dashboard:view",
  },
  {
    title: "Eventos",
    href: "/dashboard/eventos",
    icon: "calendar",
    requires: "events:view",
  },

  {
    title: "Stock de Tickets",
    href: "/dashboard/ticket-stock",
    icon: "ticket",
    requires: "ticket-stock:view",
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: "chart",
    requires: "reports:view",
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: "settings",
    requires: "settings:view",
  },
];

export function getSidebarNav(role: AppRole | null): NavItem[] {
  const user: JwtUser = { role };
  const permissions = getPermissions(user);

  return ALL_NAV_ITEMS.filter((item) => permissions.has(item.requires)).map(
    ({ requires: _requires, ...rest }) => rest,
  );
}
