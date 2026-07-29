"use client";

import Link from "next/link";
import {
  CreditCard,
  Image,
  Pencil,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Ticket,
  UserPlus,
} from "lucide-react";
import { ElementType } from "react";

interface ActionItem {
  href: string;
  icon: ElementType;
  label: string;
  description: string;
  ownerOnly: boolean;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    href: "editar",
    icon: Pencil,
    label: "Editar evento",
    description: "Actualizá los datos del evento",
    ownerOnly: true,
  },
  {
    href: "imagenes",
    icon: Image,
    label: "Imágenes",
    description: "Imagen principal y miniatura",
    ownerOnly: true,
  },
  {
    href: "entradas",
    icon: Ticket,
    label: "Entradas",
    description: "Tipos de entradas y stock",
    ownerOnly: true,
  },
  {
    href: "vender-entrada",
    icon: ShoppingCart,
    label: "Vender entrada",
    description: "Emitir una entrada manualmente",
    ownerOnly: false,
  },
  {
    href: "ventas",
    icon: Receipt,
    label: "Entradas vendidas",
    description: "Consultá las ventas realizadas",
    ownerOnly: true,
  },
  {
    href: "invitados",
    icon: UserPlus,
    label: "Invitaciones",
    description: "Emitir y gestionar invitaciones",
    ownerOnly: true,
  },
  {
    href: "validadores",
    icon: ShieldCheck,
    label: "Validadores",
    description: "Administrá los accesos al evento",
    ownerOnly: true,
  },
  {
    href: "descuentos",
    icon: Tag,
    label: "Códigos de descuento",
    description: "Creá y editá códigos de descuento",
    ownerOnly: true,
  },
  {
    href: "metodos-de-pago",
    icon: CreditCard,
    label: "Métodos de pago",
    description: "Configurá los métodos de cobro",
    ownerOnly: true,
  },
];

interface EventActionGridProps {
  baseHref: string;
  isEventOwner: boolean;
}

export default function EventActionGrid({
  baseHref,
  isEventOwner,
}: EventActionGridProps) {
  const visibleItems = ACTION_ITEMS.filter(
    (item) => !item.ownerOnly || isEventOwner
  );

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {visibleItems.map(({ href, icon: Icon, label, description }) => (
        <Link
          key={href}
          href={`${baseHref}/${href}`}
          className="flex flex-col items-center gap-3 rounded-xl border bg-card p-3 text-center shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
          <div>
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
