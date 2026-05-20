import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Plus, Pencil } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Publicado",
  INACTIVE: "Pausado",
  SOLDOUT: "Agotado",
  ENDED: "Finalizado",
  DELETED: "Eliminado",
};

export default function TicketTypeAccordion({
  evento,
  ticketTypes,
  remainingTickets,
}: {
  ticketTypes: TicketType[];
  evento: Evento;
  remainingTickets: number;
}) {
  return (
    <div className="w-full mx-auto text-left">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tipos de ticket</h2>
          <div className="flex items-center gap-3">
            <Card className="flex items-center gap-1 px-4 py-2 leading-none">
              Disponibles{" "}
              <span className="font-bold">{remainingTickets}</span>{" "}
              <Ticket className="w-5 h-5" />
            </Card>
            <Button asChild>
              <Link
                href={`/dashboard/evento/${evento.id}/ticket-types/new`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo tipo de ticket
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {ticketTypes.length > 0 ? (
            ticketTypes.map((ticket) => (
              <Card
                key={ticket.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${ticket.price} · {ticket.quantity} disponibles
                    </p>
                  </div>
                  <Badge variant="outline">
                    {STATUS_LABELS[ticket.status] ?? ticket.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/dashboard/evento/${evento.id}/ticket-types/${ticket.id}/edit`}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4">
              No hay tipos de ticket creados aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
