"use client";
import { TicketsCountType } from "@/app/validar/[eventId]/event-info";
import { Evento } from "@/types/event";
import { TicketOrderType } from "@/types/tickets";

type Props = {
  eventTitle?: string;
  ticketsData: Partial<TicketOrderType>[];
  soldCount?: any;
  ticketsCount?: TicketsCountType;
};

export default function ValidatorsPageHeader({
  ticketsData,
  soldCount = 0,
  ticketsCount,
  eventTitle,
}: Props) {
  const validatedTicketsCount = ticketsData.filter(
    (ticket) => ticket.status === "VALIDATED"
  ).length;
  const firstTicket = ticketsData[0];

  return (
    <div className="bg-gray-50 py-10">
      <div>
        {firstTicket && "event" in firstTicket && (
          <h1 className="text-3xl font-bold mb-4 uppercase">{eventTitle}</h1>
        )}
        <div className="pl-2">
          <ul className="space-y-1">
            <li>
              <span className="font-bold">Entradas vendidas:</span> {soldCount}
            </li>
            <li>
              <span className="font-bold">Entradas validadas:</span>{" "}
              {validatedTicketsCount}
            </li>
            <li>
              <span className="font-bold">Entradas no validadas:</span>{" "}
              {soldCount - validatedTicketsCount}
            </li>
            {ticketsCount &&
              Object.entries(ticketsCount).map(([ticketTypeId, ticketInfo]) => (
                <li key={ticketTypeId}>
                  <span className="font-bold">{ticketInfo.title}</span>{" "}
                  {ticketInfo.count}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
