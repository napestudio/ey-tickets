"use client";
import { Evento } from "@/types/event";
import EventFilters from "../components/event-filters";
import EventCard from "../../../components/dashboard/event-card";
import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { Session } from "next-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { datesFormater, formatDatesByMonth } from "@/lib/utils";
import { getStats } from "@/lib/actions";
import EventListItem from "@/components/dashboard/event-list-item";
import { Input } from "@/components/ui/input";
export default function EventsHandler({
  eventos,
  session,
}: {
  eventos: Evento[];
  session: Session;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = eventos.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  return (
    <Card>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px]"
            />
          </div>
        </div>
        <div className="rounded-md border max-w-[90vw]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha(s)</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Organizador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Recaudación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((evento) => {
                return (
                  <TableRow key={evento.id}>
                    <EventListItem evento={evento} />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {eventos.length == 0 && (
          <Card className="p-6">No hay eventos creados.</Card>
        )}
      </div>
    </Card>
  );
}
