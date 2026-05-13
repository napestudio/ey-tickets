import { OrganizationRole } from "@/types/user";

const FULL_NAV = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
  { title: "Usuarios", href: "/dashboard/usuarios", icon: "users" },
  { title: "Métodos de pago", href: "/dashboard/metodos-de-pago", icon: "sales" },
];

const SELLER_NAV = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
];

export function getSidebarNav(
  role: OrganizationRole | null,
  isSuperAdmin: boolean
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
