import {
  getEventById,
  getRemainingTicketsForEvent,
  getTicketTypesWithStatsByEventId,
} from "@/lib/actions";
import TicketTypesTable from "@/app/(dashboard)/dashboard/components/ticket-types-table/ticket-types-table";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Ticket } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Tipos de tickets",
};

export default async function TicketTypePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const evento = await getEventById(eventId);

  if (!evento) return null;

  const [rawTicketTypes] = await Promise.all([
    getTicketTypesWithStatsByEventId(eventId),
  ]);

  const ticketTypes = rawTicketTypes.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    createdBy: t.createdBy ?? null,
    dates: t.dates ?? null,
    price: Number(t.price),
    isFree: t.isFree,
    eventId: t.eventId,
  }));

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader
        title="Tipos de tickets"
        subtitle={`Evento: ${evento.title}`}
      />
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/evento/${eventId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Evento
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/dashboard/evento/${eventId}/ticket-types/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo tipo de ticket
          </Link>
        </Button>
      </div>
      <TicketTypesTable ticketTypes={ticketTypes} />
    </div>
  );
}
