import { UserType } from "@/types/user";

export function getSidebarNav(userType: UserType) {
  switch (userType) {
    case "SELLER":
      return [
        { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
      ];
    case "PRODUCER":
    case "ADMIN":
    case "SUPERADMIN":
      return [
        { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
        { title: "Usuarios", href: "/dashboard/usuarios", icon: "users" },
        {
          title: "Métodos de pago",
          href: "/dashboard/metodos-de-pago",
          icon: "sales",
        },
      ];

    default:
      return [
        { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { title: "Eventos", href: "/dashboard/eventos", icon: "calendar" },
        { title: "Usuarios", href: "/dashboard/usuarios", icon: "users" },
        {
          title: "Métodos de pago",
          href: "/dashboard/metodos-de-pago",
          icon: "sales",
        },
      ];
  }
}
