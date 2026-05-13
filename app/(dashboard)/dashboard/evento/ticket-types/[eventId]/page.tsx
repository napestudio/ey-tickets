import {
  getEventById,
  getRemainingTicketsByProducer,
  getTicketTypesByEventId,
} from "@/lib/actions";
import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";
import TicketTypeAccordion from "@/app/(dashboard)/dashboard/components/ticket-types-accordion/ticket-types-accordion";
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
  const eventTicketTypes = await getTicketTypesByEventId(eventId);
  const remainingTickets = await getRemainingTicketsByProducer(
    evento?.producerId || ""
  );
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Tipos de tickets
      </h1>
      <TicketTypeAccordion
        ticketTypes={eventTicketTypes as unknown as TicketType[]}
        evento={evento as unknown as Evento}
        remainingTickets={remainingTickets}
      />
    </>
  );
}
