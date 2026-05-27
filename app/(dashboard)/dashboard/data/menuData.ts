interface MenuItem {
  title: string;
  href: string;
}

interface MenuSection {
  title: string;
  items?: MenuItem[];
  href?: string;
}

export const menuData: MenuSection[] = [
  {
    title: "Panel",
    href: "/dashboard",
  },
  {
    title: "Eventos",
    items: [
      { title: "Nuevo", href: "/dashboard/nuevo-evento/" },
      { title: "Lista de eventos", href: "/dashboard/eventos/" },
      { title: "Codigos de descuento", href: "/dashboard/codigos" },
    ],
  },
  {
    title: "Cuentas",
    items: [
      { title: "Listado", href: "/dashboard/clientes" },
      { title: "Invitaciones", href: "/dashboard/clientes/invitaciones" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { title: "MercadoPago", href: "/dashboard/configuracion/mercado-pago" },
      { title: "Métodos de pago", href: "/dashboard/metodos-de-pago" },
      { title: "Punto de venta", href: "/dashboard/punto-de-venta" },
    ],
  },
  // { title: "Perfil", href: "/dashboard/configuracion/perfil" },
];
