"use client";
import { Evento } from "@/types/event";
import { TableCell, TableRow } from "../ui/table";
import Image from "next/image";
import { datesFormater } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function EventListItem({ evento }: { evento: Evento }) {
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: {
        label: "ACTIVO",
        color: "bg-cyan-500/20 text-green-700 hover:bg-green-500/20",
      },
      CONCLUDED: {
        label: "FINALIZADO",
        color: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20",
      },
      CANCELED: {
        label: "CANCELADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },
      DELETED: {
        label: "ELIMINADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },

      DEFAULT: {
        label: status,
        color: "",
      },
    };

    const { label, color } = statusMap[status] || statusMap.DEFAULT;

    return (
      <Badge className={color} variant="secondary">
        {label}
      </Badge>
    );
  };

  const formattedDate = datesFormater(evento.dates);
  return (
    <>
      <TableCell>
        <div className="relative h-15 w-15">
          <Image
            src={evento.image || "/placeholder.svg"}
            alt={evento.title}
            width={60}
            height={60}
            className="rounded w-full h-full object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{evento.title}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="max-w-45 truncate">
        {evento?.venue || evento.address}
      </TableCell>
      <TableCell>{evento.producer?.name}</TableCell>

      <TableCell>{renderStatusBadge(evento.status || "")}</TableCell>
      <TableCell>
        {evento.eventType === "PUBLIC"
          ? "Público"
          : evento.eventType === "PRIVATE"
            ? "Privado"
            : "-"}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/evento/${evento.id}`}>Ver detalles</Link>
            </DropdownMenuItem>
            {evento.status === "ACTIVE" ||
              (evento.status === "DRAFT" && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/evento/${evento.id}/edit`}>
                    Editar evento
                  </Link>
                </DropdownMenuItem>
              ))}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/evento/ticket-types/${evento.id}`}>
                Tickets
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
}
