export interface DocsNavLink {
  title: string;
  href: string;
}

export interface DocsNavSection {
  title: string;
  links: DocsNavLink[];
}

/**
 * Fuente única de la navegación de /docs. El sidebar y las páginas de índice
 * se generan a partir de esto — no se infiere del filesystem. Al agregar una
 * guía nueva hay que agregar su entrada acá para que aparezca en el sidebar.
 */
export const DOCS_NAV: DocsNavSection[] = [
  {
    title: "Primeros pasos",
    links: [{ title: "Introducción", href: "/docs" }],
  },
  {
    title: "Eventos",
    links: [
      { title: "Crear un evento", href: "/docs/eventos/crear" },
      { title: "Editar un evento", href: "/docs/eventos/editar" },
      { title: "Eliminar un evento", href: "/docs/eventos/eliminar" },
      { title: "Crear tipos de entrada", href: "/docs/eventos/tipos-de-entrada" },
      {
        title: "Asignar y ajustar stock de entradas",
        href: "/docs/eventos/asignar-entradas",
      },
    ],
  },
];
