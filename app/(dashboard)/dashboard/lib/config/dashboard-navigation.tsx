import { AppRole } from "@/types/user";
import { getPermissions, JwtUser, Permission } from "@/lib/route-permissions";

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: string;
  children?: NavSubItem[];
}

type RawNavSubItem = NavSubItem & { requires?: Permission };

type RawNavItem = {
  title: string;
  href?: string;
  icon: string;
  requires: Permission;
  children?: RawNavSubItem[];
};

// Todos los items posibles de navegación, en orden de display.
// Cada uno requiere un permiso específico para ser visible.
const ALL_NAV_ITEMS: RawNavItem[] = [
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
    title: "Métodos de pago",
    href: "/dashboard/configuracion/metodos-de-pago",
    icon: "sales",
    requires: "payment-methods:view",
  },
  {
    title: "Configuración",
    icon: "settings",
    requires: "settings:view",
    children: [
      {
        title: "Productora",
        href: "/dashboard/configuracion/productora",
        requires: "settings:producer",
      },
      {
        title: "Usuarios",
        href: "/dashboard/configuracion/usuarios",
        requires: "settings:producer",
      },
      { title: "Perfil", href: "/dashboard/configuracion/perfil" },
    ],
  },
];

export function getSidebarNav(role: AppRole | null): NavItem[] {
  const user: JwtUser = { role };
  const permissions = getPermissions(user);

  return ALL_NAV_ITEMS.filter((item) => permissions.has(item.requires)).map(
    ({ requires: _requires, children, ...rest }) => ({
      ...rest,
      ...(children
        ? {
            children: children
              .filter(
                (child) => !child.requires || permissions.has(child.requires),
              )
              .map(({ requires: _r, ...childRest }) => childRest),
          }
        : {}),
    }),
  );
}
