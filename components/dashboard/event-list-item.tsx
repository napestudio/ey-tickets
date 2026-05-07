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
import { getStats } from "@/lib/actions";
import { useCallback, useEffect, useState } from "react";

export default function EventListItem({ evento }: { evento: Evento }) {
  const [total, setTotal] = useState<any>();

  const fetchData = useCallback(async () => {
    const res = await getStats({ eventId: evento.id });

    setTotal(res.totalRevenue);
  }, [evento.id]);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

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
        <div className="relative h-10 w-[60px]">
          <Image
            src={evento.image || "/placeholder.svg"}
            alt={evento.title}
            fill
            className="rounded object-cover"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">{evento.title}</TableCell>
      <TableCell>{formattedDate}</TableCell>
      <TableCell className="max-w-[180px] truncate">
        {evento.location}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{evento.user?.name}</Badge>
      </TableCell>

      <TableCell>{renderStatusBadge(evento.status || "")}</TableCell>
      <TableCell>
        <div className="w-[100px] space-y-1">
          <div className="text-xs font-bold">
            $ {total?.toLocaleString("es-ar")}
          </div>
          {/* <Progress value={soldPercentage} className="h-2" /> */}
        </div>
      </TableCell>
      <TableCell className="text-right">
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
            <DropdownMenuItem>
              {" "}
              <Link href={`/dashboard/evento/${evento.id}/edit?tab=tickets`}>
                Tickets
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
}
