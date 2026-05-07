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

export async function getUserMaxTickets(userId: string): Promise<number> {
  const config = await prisma.userConfiguration.findUnique({
    where: { userId },
    select: { maxTicketsAmount: true },
  });

  return config?.maxTicketsAmount ?? 0;
}

export async function getRemainingTicketsByUser(userId: string) {
  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      userId,
    },
    select: {
      endDate: true,
      ticketTypes: {
        where: {
          NOT: { status: "DELETED" }, // filtramos los borrados
        },
        select: {
          quantity: true,
          status: true,
          orders: {
            where: {
              isInvitation: false,
            },
            select: {
              quantity: true,
            },
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
        usedTickets += sold; // solo contamos los que se vendieron
      }
    }
  }
  const max = await getUserMaxTickets(userId);

  return max - usedTickets;
}

export async function createTicketTypeWithLimit(
  ticket: TicketType,
  userId: string
) {
  const max = await getUserMaxTickets(userId);
  const currentUsed = await getRemainingTicketsByUser(userId);

  if (currentUsed + ticket.quantity > max) {
    throw new Error(
      `Superaste el límite de tickets disponibles. Ya usaste ${currentUsed} de ${max}.`
    );
  }

  return prisma.ticketType.create({ data: ticket });
}
