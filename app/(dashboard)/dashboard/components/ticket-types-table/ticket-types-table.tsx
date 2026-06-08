"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { DatesType } from "@/types/tickets";
import { formatPrice } from "@/lib/utils";

type TicketRow = {
  id: string;
  title: string;
  status: string;
  createdBy: { id: string; name: string | null } | null;
  dates: string | null;
  price: number;
  isFree: boolean;
  endDate: Date | null;
  quantity: number;
  totalSold: number;
  eventId: string;
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Publicado",
  INACTIVE: "Pausado",
  SOLDOUT: "Agotado",
  ENDED: "Finalizado",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  SOLDOUT: "destructive",
  ENDED: "outline",
};

export default function TicketTypesTable({
  ticketTypes,
}: {
  ticketTypes: TicketRow[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return ticketTypes.filter((t) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ticketTypes, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Publicado</SelectItem>
            <SelectItem value="INACTIVE">Pausado</SelectItem>
            <SelectItem value="SOLDOUT">Agotado</SelectItem>
            <SelectItem value="ENDED">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Creado por</TableHead>
            <TableHead>Fecha(s)</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Disponible hasta</TableHead>
            <TableHead>Asignadas / Vendidas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-10"
              >
                No hay tipos de ticket que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((ticket) => {
              const soldPct =
                ticket.quantity > 0
                  ? Math.round((ticket.totalSold / ticket.quantity) * 100)
                  : 0;

              let parsedDates: DatesType[] = [];
              try {
                if (ticket.dates) parsedDates = JSON.parse(ticket.dates);
              } catch {
                parsedDates = [];
              }

              return (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{ticket.title}</span>
                      <Badge
                        variant={STATUS_VARIANTS[ticket.status] ?? "outline"}
                        className="w-fit text-xs"
                      >
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {ticket.createdBy?.name ?? "—"}
                  </TableCell>

                  <TableCell>
                    {parsedDates.length > 0 ? (
                      <div className="flex flex-col gap-0.5 text-sm">
                        {parsedDates.map((d, i) => (
                          <span key={i}>
                            {format(new Date(d.date), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">
                    {ticket.isFree
                      ? "Gratis"
                      : formatPrice(Number(ticket.price))}
                  </TableCell>

                  <TableCell className="text-sm">
                    {ticket.endDate ? (
                      format(new Date(ticket.endDate), "dd MMM yyyy", {
                        locale: es,
                      })
                    ) : (
                      <span className="text-muted-foreground">Sin límite</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 min-w-36">
                      <div className="flex justify-between text-sm">
                        <span>{ticket.totalSold} vendidas</span>
                        <span className="text-muted-foreground">
                          / {ticket.quantity}
                        </span>
                      </div>
                      <Progress value={soldPct} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {soldPct}% vendido
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/evento/${ticket.eventId}/ticket-types/${ticket.id}/edit`}
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
