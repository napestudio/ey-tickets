import { TicketType } from "@/types/tickets";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { isAfter } from "date-fns";
import {
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

export async function getTicketTypeWithSoldCount(ticketTypeId: string) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: {
      orders: {
        where: { status: "PAID", isInvitation: false },
        select: { quantity: true },
      },
    },
  });
  if (!ticketType) return null;
  const soldCount = ticketType.orders.reduce((acc, o) => acc + o.quantity, 0);
  const { orders, ...ticketTypeData } = ticketType;
  return { ...ticketTypeData, soldCount };
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
  const { createdBy, ...createData } = data;
  return await prisma.ticketType.create({
    data: createData as Prisma.TicketTypeUncheckedCreateInput,
  });
}

export async function updateTicketType(
  ticketId: string,
  ticketData: Partial<TicketType>,
) {
  const { createdBy, id, createdAt, updatedAt, ...updateData } = ticketData;
  return await prisma.ticketType.update({
    where: { id: ticketId },
    data: updateData as Prisma.TicketTypeUncheckedUpdateInput,
  });
}

export async function updateTicketTypeWithLimit(
  ticketId: string,
  ticketData: Partial<TicketType>,
) {
  if (ticketData.quantity !== undefined) {
    // El form no incluye eventId en el payload — fetchearlo desde DB
    const current = await prisma.ticketType.findUniqueOrThrow({
      where: { id: ticketId },
      select: { eventId: true },
    });
    const eventId = current.eventId;

    const [eventAllocation, othersUsage, soldResult] = await Promise.all([
      getEventTicketAllocation(eventId),
      prisma.ticketType.aggregate({
        _sum: { quantity: true },
        where: { eventId, NOT: [{ status: "DELETED" }, { id: ticketId }] },
      }),
      prisma.order.aggregate({
        _sum: { quantity: true },
        where: { ticketTypeId: ticketId, status: "PAID", isInvitation: false },
      }),
    ]);

    if (!eventAllocation) {
      throw new Error("Este evento no tiene tickets asignados.");
    }

    const usedByOthers = othersUsage._sum.quantity ?? 0;
    const remaining = eventAllocation.quantity - usedByOthers;
    const soldCount = soldResult._sum.quantity ?? 0;

    if (ticketData.quantity > remaining) {
      throw new Error(
        `No podés asignar ${ticketData.quantity} tickets. El límite del evento permite ${remaining} para este tipo.`,
      );
    }

    if (ticketData.quantity < soldCount) {
      throw new Error(
        `No podés reducir la cantidad a ${ticketData.quantity}. Ya se vendieron ${soldCount} tickets de este tipo.`,
      );
    }
  }

  const { createdBy, id, createdAt, updatedAt, ...updateData } = ticketData;
  return await prisma.ticketType.update({
    where: { id: ticketId },
    data: updateData as Prisma.TicketTypeUncheckedUpdateInput,
  });
}

// ─── Legacy: mantenidas por compatibilidad ────────────────────────────────────

export async function getMaxTicketsPerEvent(
  producerId: string,
): Promise<number> {
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
        0,
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
  creatorUserId?: string,
) {
  // Guard: el evento debe tener una asignación explícita de stock
  const eventAllocation = await getEventTicketAllocation(ticket.eventId);
  if (!eventAllocation) {
    throw new Error(
      "Este evento no tiene tickets asignados. Asigná stock al evento antes de crear tipos de tickets.",
    );
  }

  // 1. Tope del evento
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
      `Este evento tiene un límite de ${eventAllocation.quantity} tickets. Disponibles: ${remainingForEvent}, solicitado: ${ticket.quantity}`,
    );
  }

  // 2. Cupo del miembro (si tiene asignación personal)
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
          `Superaste tu cupo personal de tickets. Disponibles: ${remainingForMember}, solicitado: ${ticket.quantity}`,
        );
      }
    }
  }

  const { createdBy, ...createData } = ticket;
  return prisma.ticketType.create({
    data: createData as Prisma.TicketTypeUncheckedCreateInput,
  });
}
