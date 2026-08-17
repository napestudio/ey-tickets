import Link from "next/link";

import { getSession } from "@/lib/auth/get-session";
import InvitadosTab from "@/components/dashboard/event-details/invitados-tab";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById, getSoldTicketCountsByTypeAction } from "@/lib/actions";
import { getSoldTicketsPaginated } from "@/lib/api/ticket-orders";
import { can } from "@/lib/permissions";
import { EventoWithTicketsType } from "@/types/event";
import { ArrowLeft } from "lucide-react";

export default async function InvitadosPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lista?: string }>;
}) {
  const [{ id }, { lista }] = await Promise.all([params, searchParams]);
  const showList = lista === "1";

  const [evento, session] = await Promise.all([getEventById(id), getSession()]);

  if (!evento || !session) return null;

  const isEventOwner = can(session.user, "events:edit");

  const [soldTickets, listData] = await Promise.all([
    getSoldTicketCountsByTypeAction(id),
    showList
      ? getSoldTicketsPaginated(id, {
          page: 1,
          pageSize: 10,
          onlyInvitations: true,
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Invitaciones"
        subtitle={`Gestión de invitaciones para ${evento.title}`}
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <InvitadosTab
        evento={evento as unknown as EventoWithTicketsType}
        isEventOwner={isEventOwner}
        soldTickets={soldTickets}
        initialTickets={listData?.tickets ?? null}
        totalCount={listData?.total ?? 0}
        showList={showList}
        eventId={id}
      />
    </div>
  );
}
