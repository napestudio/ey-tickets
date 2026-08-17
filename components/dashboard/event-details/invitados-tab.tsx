import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { List, User } from "lucide-react";

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
  initialTickets: unknown[] | null;
  totalCount: number;
  showList: boolean;
  eventId: string;
}

export default function InvitadosTab({
  evento,
  isEventOwner,
  soldTickets,
  initialTickets,
  totalCount,
  showList,
  eventId,
}: InvitadosTabProps) {
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
        {showList && initialTickets !== null ? (
          <SoldTicketsTable
            initialTickets={initialTickets as Parameters<typeof SoldTicketsTable>[0]["initialTickets"]}
            totalCount={totalCount}
            eventId={evento.id}
            eventTitle={evento.title}
            eventAddress={evento.address}
            initialOnlyInvitations={true}
            showInvitationsToggle={false}
            emptyMessage="No hay invitados."
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <List className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Lista de invitados</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cargá la lista cuando la necesites para evitar consultas
                innecesarias.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/evento/${eventId}/invitados?lista=1`}>
                Cargar lista
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
