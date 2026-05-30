import {
  getEventById,
  getRemainingTicketsForEvent,
  getTicketTypesWithStatsByEventId,
} from "@/lib/actions";
import { getEventTicketAllocation } from "@/lib/api/ticket-stock";
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

  const [rawTicketTypes, remainingTickets, eventAllocation] = await Promise.all(
    [
      getTicketTypesWithStatsByEventId(eventId),
      getRemainingTicketsForEvent(eventId, evento?.producerId || ""),
      getEventTicketAllocation(eventId),
    ],
  );

  const hasAllocation = !!eventAllocation;

  const ticketTypes = rawTicketTypes.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    createdBy: t.createdBy ?? null,
    dates: t.dates ?? null,
    price: Number(t.price),
    isFree: t.isFree,
    endDate: t.endDate ?? null,
    quantity: t.quantity,
    totalSold: t.orders.reduce((sum, o) => sum + o.quantity, 0),
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
        <div className="flex items-center gap-3">
          <div className="flex flex-nowrap items-center gap-2 px-4 py-2 leading-none text-sm">
            Disponibles <span className="font-bold">{remainingTickets}</span>
            <Ticket className="w-4 h-4" />
          </div>
          <Button asChild={hasAllocation} disabled={!hasAllocation}>
            {hasAllocation ? (
              <Link href={`/dashboard/evento/${eventId}/ticket-types/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo tipo de ticket
              </Link>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo tipo de ticket
              </>
            )}
          </Button>
        </div>
      </div>
      {!hasAllocation && (
        <p className="text-sm text-muted-foreground">
          Este evento no tiene tickets asignados. Asigná stock desde{" "}
          <Link href="/dashboard/ticket-stock" className="underline">
            Gestión de stock
          </Link>{" "}
          para poder crear tipos de tickets.
        </p>
      )}
      <TicketTypesTable ticketTypes={ticketTypes} />
    </div>
  );
}
