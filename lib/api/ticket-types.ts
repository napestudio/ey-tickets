import { TicketType } from "@/types/tickets";
import {prisma} from "../prisma";
import { isAfter } from "date-fns";

export async function getTicketTypesById(ticketTypeId: string) {
  return await prisma.ticketType.findUnique({
    where: {
      id: ticketTypeId,
    },
  });
}
export async function getTicketTypesByEventId(eventId: string) {
  return await prisma.ticketType.findMany({
    where: {
      eventId: eventId,
      status: {
        not: "DELETED",
      },
    },
    orderBy: {
      position: "asc",
    },
  });
}

export async function createTicketType(data: TicketType) {
  return await prisma.ticketType.create({ data });
}

export async function updateTicketType(
  ticketId: string,
  ticketData: Partial<TicketType>
) {
  return await prisma.ticketType.update({
    where: {
      id: ticketId,
    },
    data: ticketData,
  });
}

export async function getMaxTicketsPerEvent(producerId: string): Promise<number> {
  const config = await prisma.producerConfiguration.findUnique({
    where: { producerId },
    select: { maxTicketsPerEvent: true },
  });

  return config?.maxTicketsPerEvent ?? 0;
}

export async function getRemainingTicketsByProducer(producerId: string) {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: { producerId },
    select: {
      endDate: true,
      ticketTypes: {
        where: {
          NOT: { status: "DELETED" },
        },
        select: {
          quantity: true,
          status: true,
          orders: {
            where: { isInvitation: false },
            select: { quantity: true },
          },
        },
      },
    },
  });

  let usedTickets = 0;

  for (const event of events) {
    const isEventActive = event.endDate === null || isAfter(event.endDate, now);

    for (const ticket of event.ticketTypes) {
      const sold = ticket.orders.reduce(
        (acc, order) => acc + order.quantity,
        0
      );

      if (isEventActive) {
        usedTickets += ticket.quantity;
      } else {
        usedTickets += sold;
      }
    }
  }
  const max = await getMaxTicketsPerEvent(producerId);

  return max - usedTickets;
}

export async function createTicketTypeWithLimit(
  ticket: TicketType,
  producerId: string
) {
  const max = await getMaxTicketsPerEvent(producerId);
  const remaining = await getRemainingTicketsByProducer(producerId);

  if (remaining - ticket.quantity < 0) {
    throw new Error(
      `Superaste el límite de tickets disponibles.`
    );
  }

  return prisma.ticketType.create({ data: ticket });
}
