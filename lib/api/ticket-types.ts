import { TicketType } from "@/types/tickets";
import {prisma} from "../prisma";
import { isAfter } from "date-fns";
import {
  getProducerStockSummary,
  getEventTicketAllocation,
  getMemberTicketAllocation,
} from "./ticket-stock";

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

export async function getTicketTypesWithStatsByEventId(eventId: string) {
  return await prisma.ticketType.findMany({
    where: {
      eventId,
      status: { not: "DELETED" },
    },
    orderBy: { position: "asc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      orders: {
        where: { status: "PAID", isInvitation: false },
        select: { quantity: true },
      },
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

// ─── Legacy: mantenidas por compatibilidad ────────────────────────────────────

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

// ─── Creación con validación de 3 capas ──────────────────────────────────────

export async function createTicketTypeWithLimit(
  ticket: TicketType,
  producerId: string,
  creatorUserId?: string
) {
  // 1. Pool de la productora
  const summary = await getProducerStockSummary(producerId);

  if (summary.unallocated < ticket.quantity) {
    throw new Error(
      `No hay suficiente stock disponible en la productora. Disponible: ${summary.unallocated}, solicitado: ${ticket.quantity}`
    );
  }

  // 2. Tope del evento (si tiene asignación)
  const eventAllocation = await getEventTicketAllocation(ticket.eventId);
  if (eventAllocation) {
    const existing = await prisma.ticketType.aggregate({
      _sum: { quantity: true },
      where: {
        eventId: ticket.eventId,
        NOT: { status: "DELETED" },
      },
    });
    const usedForEvent = existing._sum.quantity ?? 0;
    const remainingForEvent = eventAllocation.quantity - usedForEvent;

    if (ticket.quantity > remainingForEvent) {
      throw new Error(
        `Este evento tiene un límite de ${eventAllocation.quantity} tickets. Disponibles: ${remainingForEvent}, solicitado: ${ticket.quantity}`
      );
    }
  }

  // 3. Cupo del miembro (si tiene asignación personal)
  if (creatorUserId) {
    const memberAllocation = await getMemberTicketAllocation(creatorUserId);
    if (memberAllocation) {
      // Sumar tickets en eventos creados por este usuario en la misma productora
      const usedByMember = await prisma.ticketType.aggregate({
        _sum: { quantity: true },
        where: {
          NOT: { status: "DELETED" },
          event: {
            producerId,
            createdById: creatorUserId,
          },
        },
      });
      const usedQuantity = usedByMember._sum.quantity ?? 0;
      const remainingForMember = memberAllocation.quantity - usedQuantity;

      if (ticket.quantity > remainingForMember) {
        throw new Error(
          `Superaste tu cupo personal de tickets. Disponibles: ${remainingForMember}, solicitado: ${ticket.quantity}`
        );
      }
    }
  }

  return prisma.ticketType.create({ data: ticket });
}
