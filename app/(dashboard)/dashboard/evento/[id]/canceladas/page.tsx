import Link from "next/link";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/actions";
import { getSoldTicketsPaginated } from "@/lib/api/ticket-orders";
import SoldTicketsTable from "@/components/dashboard/sold-tickets-table";
import { ArrowLeft } from "lucide-react";

export default async function CanceladasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventById(id);

  if (!evento) return null;

  const isPrivate = evento.eventType === "PRIVATE";
  const backHref = isPrivate
    ? `/dashboard/evento/${id}/invitados`
    : `/dashboard/evento/${id}/ventas`;
  const backLabel = isPrivate ? "Volver a invitaciones" : "Volver a entradas vendidas";

  const { tickets, total } = await getSoldTicketsPaginated(id, {
    page: 1,
    pageSize: 10,
    onlyCanceled: true,
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={evento.title}
        subtitle="Entradas canceladas"
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      <SoldTicketsTable
        initialTickets={tickets}
        totalCount={total}
        eventId={id}
        eventTitle={evento.title}
        eventAddress={evento.address ?? ""}
        onlyCanceled={true}
        showInvitationsToggle={false}
        emptyMessage="No hay entradas canceladas."
      />
    </div>
  );
}
