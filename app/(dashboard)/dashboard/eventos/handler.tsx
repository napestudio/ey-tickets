"use client";
import { Evento } from "@/types/event";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventListItem from "@/components/dashboard/event-list-item";

const SORT_OPTIONS = [
  { value: "event_newest", label: "Evento: más nuevo primero" },
  { value: "event_oldest", label: "Evento: más viejo primero" },
  { value: "created_newest", label: "Creación: más reciente" },
  { value: "created_oldest", label: "Creación: más antigua" },
];

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos los estados" },
  { value: "ACTIVE", label: "Activo" },
  { value: "DRAFT", label: "Borrador" },
  { value: "CONCLUDED", label: "Finalizado" },
  { value: "CANCELED", label: "Cancelado" },
];

export default function EventsHandler({
  eventos,
  session,
}: {
  eventos: Evento[];
  session: Session;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("event_newest");
  const [producerFilter, setProducerFilter] = useState("ALL");

  const uniqueProducers = [
    ...new Set(
      eventos.map((e) => e.producer?.name).filter((name): name is string => Boolean(name))
    ),
  ];

  const filteredEvents = eventos
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.producer?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;

      const matchesProducer =
        producerFilter === "ALL" || event.producer?.name === producerFilter;

      return matchesSearch && matchesStatus && matchesProducer;
    })
    .sort((a, b) => {
      if (sortOrder === "event_newest" || sortOrder === "event_oldest") {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return sortOrder === "event_oldest" ? dateA - dateB : dateB - dateA;
      }
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "created_oldest"
        ? createdA - createdB
        : createdB - createdA;
    });

  return (
    <Card>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-55"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {uniqueProducers.length > 1 && (
            <Select value={producerFilter} onValueChange={setProducerFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Organizador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los organizadores</SelectItem>
                {uniqueProducers.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border max-w-[90vw]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20"></TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha(s)</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Organizador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((evento) => (
                <TableRow
                  key={evento.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/evento/${evento.id}`)}
                >
                  <EventListItem evento={evento} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {eventos.length === 0 && (
          <Card className="p-6">No hay eventos creados.</Card>
        )}
      </div>
    </Card>
  );
}
