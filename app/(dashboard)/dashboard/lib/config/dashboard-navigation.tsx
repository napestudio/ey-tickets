import { OrganizationRole } from "@/types/user";

const FULL_NAV = [
  { title: "Inicio", href: "/dashboard", icon: "dashboard" },
  { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
  { title: "Usuarios", href: "/dashboard/usuarios", icon: "users" },
  {
    title: "Stock de Tickets",
    href: "/dashboard/ticket-stock",
    icon: "ticket",
  },
  {
    title: "Métodos de pago",
    href: "/dashboard/metodos-de-pago",
    icon: "sales",
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: "chart",
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: "settings",
  },
];

const SELLER_NAV = [
  { title: "Inicio", href: "/dashboard", icon: "dashboard" },
  { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: "settings",
  },
];

export function getSidebarNav(
  role: OrganizationRole | null,
  isSuperAdmin: boolean,
) {
  if (isSuperAdmin) return FULL_NAV;

  switch (role) {
    case "SELLER":
    case "MANAGER":
      return SELLER_NAV;
    case "OWNER":
    case "ADMIN":
    default:
      return FULL_NAV;
  }
}
