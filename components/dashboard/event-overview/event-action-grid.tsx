"use client";

import Link from "next/link";
import {
  BarChart2,
  CreditCard,
  Image,
  Pencil,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Ticket,
  UserPlus,
  Zap,
} from "lucide-react";
import { ElementType } from "react";
import { EventType } from "@/types/event";

interface ActionItem {
  href: (eventId: string) => string;
  icon: ElementType;
  label: string;
  description: string;
  ownerOnly: boolean;
  /** Item is hidden for PRIVATE events */
  publicOnly?: boolean;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    href: (id) => `/dashboard/evento/${id}/editar`,
    icon: Pencil,
    label: "Editar evento",
    description: "Actualizá los datos del evento",
    ownerOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/ticket-types/${id}`,
    icon: Ticket,
    label: "Tipos de entradas",
    description: "Tipos de entradas y stock",
    ownerOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/invitados`,
    icon: UserPlus,
    label: "Invitaciones",
    description: "Emitir y gestionar invitaciones",
    ownerOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/vender-entrada`,
    icon: ShoppingCart,
    label: "Vender entrada",
    description: "Emitir una entrada manualmente",
    ownerOnly: false,
    publicOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/venta-rapida`,
    icon: Zap,
    label: "Venta Rápida",
    description: "Venta en puerta sin datos personales",
    ownerOnly: false,
    publicOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/imagenes`,
    icon: Image,
    label: "Imágenes",
    description: "Imagen principal y miniatura",
    ownerOnly: true,
  },

  {
    href: (id) => `/dashboard/evento/${id}/ventas`,
    icon: Receipt,
    label: "Entradas vendidas",
    description: "Consultá las ventas realizadas",
    ownerOnly: true,
    publicOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/validadores`,
    icon: ShieldCheck,
    label: "Validadores",
    description: "Administrá los accesos al evento",
    ownerOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/descuentos`,
    icon: Tag,
    label: "Códigos de descuento",
    description: "Creá y editá códigos de descuento",
    ownerOnly: true,
    publicOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/metodos-de-pago`,
    icon: CreditCard,
    label: "Métodos de pago",
    description: "Configurá los métodos de cobro",
    ownerOnly: true,
    publicOnly: true,
  },
  {
    href: (id) => `/dashboard/evento/${id}/reportes`,
    icon: BarChart2,
    label: "Reportes",
    description: "Estadísticas y resumen de ventas",
    ownerOnly: true,
  },
];

interface EventActionGridProps {
  eventId: string;
  isEventOwner: boolean;
  eventType?: EventType | null;
}

export default function EventActionGrid({
  eventId,
  isEventOwner,
  eventType,
}: EventActionGridProps) {
  const isPrivate = eventType === "PRIVATE";

  const visibleItems = ACTION_ITEMS.filter((item) => {
    if (item.ownerOnly && !isEventOwner) return false;
    if (item.publicOnly && isPrivate) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {visibleItems.map(({ href, icon: Icon, label, description }) => (
        <Link
          key={href(eventId)}
          href={href(eventId)}
          className="flex flex-col items-center gap-3 rounded-xl bg-linear-to-tl from-neutral-950 to-ey-dark/75 text-neutral-50 border-ey-turquoise hover:from-neutral-800 hover:text-neutral-50 border-2 p-3 text-center shadow-sm transition-colors"
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs">{description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
