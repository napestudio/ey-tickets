import {
  getEventById,
  getRemainingTicketsByUser,
  getTicketTypesByEventId,
} from "@/lib/actions";
import { Evento } from "@/types/event";
import TicketTypeAccordion from "@/app/dashboard/components/ticket-types-accordion/ticket-types-accordion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Tipos de tickets",
};

export default async function TicketType({
  params,
}: {
  params: { eventId: string };
}) {
  const evento = await getEventById(params.eventId);
  const eventTicketTypes = await getTicketTypesByEventId(params.eventId);
  const remainingTickets = await getRemainingTicketsByUser(
    evento?.userId || ""
  );
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Tipos de tickets
      </h1>
      <TicketTypeAccordion
        ticketTypes={eventTicketTypes}
        evento={evento as Evento}
        remainingTickets={remainingTickets}
      />
    </>
  );
}
