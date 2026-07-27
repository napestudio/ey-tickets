"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2 } from "lucide-react";
import { datesFormater } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<
  string,
  { label: string; variant: "secondary" | "destructive" | "outline" }
> = {
  ACTIVE: { label: "Activo", variant: "secondary" },
  DRAFT: { label: "Borrador", variant: "outline" },
  CONCLUDED: { label: "Finalizado", variant: "outline" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
};

type ReportEvent = {
  id: string;
  title: string;
  status: string;
  dates: string | null;
  venue: string | null;
};

interface EventReportListProps {
  events: ReportEvent[];
}

export default function EventReportList({ events }: EventReportListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (page > 3) pages.push("ellipsis");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
      pages.push(p);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  }

  return (
    <Card>
      <div className="p-4 flex flex-col gap-4">
        <Input
          placeholder="Buscar eventos..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64"
        />

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {events.length === 0
              ? "No hay eventos disponibles."
              : "No hay eventos que coincidan con la búsqueda."}
          </p>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha(s)</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="text-right">Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((event) => {
                    const statusInfo = STATUS_MAP[event.status] ?? {
                      label: event.status,
                      variant: "outline" as const,
                    };
                    return (
                      <TableRow
                        key={event.id}
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/reportes/${event.id}`)
                        }
                      >
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {event.dates ? datesFormater(event.dates) : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {event.venue ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/dashboard/reportes/${event.id}`}>
                              <BarChart2 className="h-4 w-4 mr-1" />
                              Ver detalle
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>
                  {filtered.length} evento{filtered.length !== 1 ? "s" : ""} —
                  página {page} de {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  {getPageNumbers().map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="px-1">
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === page ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
