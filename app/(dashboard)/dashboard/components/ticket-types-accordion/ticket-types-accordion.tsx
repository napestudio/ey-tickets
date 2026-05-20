import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ticket, Plus } from "lucide-react";
import Link from "next/link";
import InfoTicketTypeCard from "@/components/dashboard/info-ticket-type-card";

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
          <div className="flex items-center gap-3">
            <Card className="flex items-center gap-1 px-4 py-2 leading-none">
              Disponibles <span className="font-bold">{remainingTickets}</span>{" "}
              <Ticket className="w-5 h-5" />
            </Card>
          </div>
          <Button asChild>
            <Link href={`/dashboard/evento/${evento.id}/ticket-types/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tipo de ticket
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {ticketTypes.length > 0 ? (
            ticketTypes.map((ticket) => (
              <InfoTicketTypeCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <p className="text-muted-foreground text-sm py-4 col-span-full">
              No hay tipos de ticket creados aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
