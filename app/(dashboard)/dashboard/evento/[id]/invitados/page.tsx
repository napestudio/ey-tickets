import Link from "next/link";

import { getSession } from "@/lib/auth/get-session";
import InvitadosTab from "@/components/dashboard/event-details/invitados-tab";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById, getSoldTicketCountsByTypeAction } from "@/lib/actions";
import { getSoldTicketsPaginated } from "@/lib/api/ticket-orders";
import { can } from "@/lib/permissions";
import { Evento, EventoWithTicketsType } from "@/types/event";
import { ArrowLeft, User, XCircle } from "lucide-react";
import { AddInvitationDialog } from "@/components/dashboard/add-invitation-dialog";

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
          excludeCanceled: true,
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Invitaciones"
        subtitle={`Gestión de invitaciones para ${evento.title}`}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/evento/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al evento
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/evento/${id}/canceladas`}>
              <XCircle className="mr-2 h-4 w-4" />
              Ver canceladas
            </Link>
          </Button>
        </div>

        <AddInvitationDialog
          evento={evento as unknown as Evento}
          soldTickets={soldTickets}
          isEventOwner={isEventOwner}
        >
          <Button
            size="sm"
            disabled={evento.status === "CANCELED"}
          >
            <User className="mr-2 h-4 w-4" />
            Agregar invitado
          </Button>
        </AddInvitationDialog>
      </div>
      <InvitadosTab
        evento={evento as unknown as EventoWithTicketsType}
        initialTickets={listData?.tickets ?? null}
        totalCount={listData?.total ?? 0}
        showList={showList}
        eventId={id}
      />
    </div>
  );
}
