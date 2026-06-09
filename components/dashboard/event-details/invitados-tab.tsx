import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento } from "@/types/event";
import { EventoWithTicketsType } from "@/types/event";
import SoldTicketsTable from "@/components/dashboard/sold-tickets-table";
import { AddInvitationDialog } from "@/components/dashboard/add-invitation-dialog";
import { getSoldTicketsPaginated } from "@/lib/api/ticket-orders";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface InvitadosTabProps {
  evento: EventoWithTicketsType;
  isEventOwner: boolean;
  soldTickets: Record<
    string,
    {
      id?: string | undefined;
      title?: string | undefined;
      count?: number | undefined;
    }
  >;
}

export default async function InvitadosTab({
  evento,
  isEventOwner,
  soldTickets,
}: InvitadosTabProps) {
  const { tickets, total } = await getSoldTicketsPaginated(evento.id, {
    page: 1,
    pageSize: 10,
    onlyInvitations: true,
  });

  return (
    <Card className="max-w-[90vw]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invitados</CardTitle>
          <CardDescription>
            Listado de invitaciones para este evento
          </CardDescription>
        </div>
        <AddInvitationDialog
          evento={evento as unknown as Evento}
          soldTickets={soldTickets}
          isEventOwner={isEventOwner}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={evento.status === "CANCELED"}
          >
            <User className="mr-2 h-4 w-4" />
            Agregar invitado
          </Button>
        </AddInvitationDialog>
      </CardHeader>
      <CardContent>
        <SoldTicketsTable
          initialTickets={tickets}
          totalCount={total}
          eventId={evento.id}
          eventTitle={evento.title}
          eventAddress={evento.address}
          initialOnlyInvitations={true}
          showInvitationsToggle={false}
          emptyMessage="No hay invitados."
        />
      </CardContent>
    </Card>
  );
}
