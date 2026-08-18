import { TicketType } from "@/types/tickets";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { isAfter } from "date-fns";
import {
  getProducerStockSummary,
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
  const [ticketType, soldAggregate, invitationAggregate] = await Promise.all([
    prisma.ticketType.findUnique({ where: { id: ticketTypeId } }),
    prisma.order.aggregate({
      _sum: { quantity: true },
      where: { ticketTypeId, status: "PAID", isInvitation: false },
    }),
    prisma.order.aggregate({
      _sum: { quantity: true },
      where: { ticketTypeId, status: "PAID", isInvitation: true },
    }),
  ]);
  if (!ticketType) return null;
  return {
    ...ticketType,
    soldCount: soldAggregate._sum.quantity ?? 0,
    invitationCount: invitationAggregate._sum.quantity ?? 0,
  };
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
    // Fetchear eventId y producerId desde DB
    const current = await prisma.ticketType.findUniqueOrThrow({
      where: { id: ticketId },
      select: { event: { select: { producerId: true } } },
    });
    const producerId = current.event.producerId;

    const [othersUsage, soldResult, memberAllocations, packages] =
      await Promise.all([
        prisma.ticketType.aggregate({
          _sum: { quantity: true },
          where: {
            NOT: [{ status: "DELETED" }, { id: ticketId }],
            event: { producerId },
          },
        }),
        prisma.order.aggregate({
          _sum: { quantity: true },
          where: { ticketTypeId: ticketId, status: "PAID", isInvitation: false },
        }),
        prisma.memberTicketAllocation.aggregate({
          _sum: { quantity: true },
          where: { producerId },
        }),
        prisma.ticketPackage.aggregate({
          _sum: { quantity: true },
          where: { producerId, status: "ACTIVE", paymentStatus: "PAID" },
        }),
      ]);

    const totalPool = packages._sum.quantity ?? 0;
    const allocatedToMembers = memberAllocations._sum.quantity ?? 0;
    const usedByOthers = othersUsage._sum.quantity ?? 0;
    const remaining = totalPool - allocatedToMembers - usedByOthers;
    const soldCount = soldResult._sum.quantity ?? 0;

    if (ticketData.quantity > remaining) {
      throw new Error(
        `No podés asignar ${ticketData.quantity} tickets. El pool de la productora permite ${remaining} adicionales.`,
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
      saleEndDate: true,
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
    const isEventActive = event.saleEndDate === null || isAfter(event.saleEndDate, now);

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
  // 1. Validar contra el pool de la productora
  const summary = await getProducerStockSummary(producerId);

  if (ticket.quantity > summary.available) {
    throw new Error(
      `Stock insuficiente en el pool. Disponible: ${summary.available}, solicitado: ${ticket.quantity}`,
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

// ─── Stock movement (delta-based) ────────────────────────────────────────────

export async function adjustTicketTypeStock(
  ticketTypeId: string,
  delta: number,
  performedById: string,
  producerId: string,
  reason?: string,
): Promise<{ previousQuantity: number; newQuantity: number }> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.ticketType.findUniqueOrThrow({
      where: { id: ticketTypeId },
      select: { quantity: true, eventId: true },
    });

    const previousQuantity = current.quantity;
    const newQuantity = previousQuantity + delta;

    // Floor: cannot go below the total of all PAID orders (regular + invitations)
    const soldResult = await tx.order.aggregate({
      _sum: { quantity: true },
      where: { ticketTypeId, status: "PAID" },
    });
    const soldCount = soldResult._sum.quantity ?? 0;

    if (newQuantity < 0) {
      throw new Error("El stock no puede ser negativo.");
    }
    if (newQuantity < soldCount) {
      throw new Error(
        `No podés reducir a ${newQuantity}. Ya se vendieron ${soldCount} tickets de este tipo.`,
      );
    }

    // Ceiling: only when adding — cannot exceed producer pool
    if (delta > 0) {
      const [othersUsage, memberAllocations, packages] = await Promise.all([
        tx.ticketType.aggregate({
          _sum: { quantity: true },
          where: {
            NOT: [{ status: "DELETED" }, { id: ticketTypeId }],
            event: { producerId },
          },
        }),
        tx.memberTicketAllocation.aggregate({
          _sum: { quantity: true },
          where: { producerId },
        }),
        tx.ticketPackage.aggregate({
          _sum: { quantity: true },
          where: { producerId, status: "ACTIVE", paymentStatus: "PAID" },
        }),
      ]);

      const remaining =
        (packages._sum.quantity ?? 0) -
        (memberAllocations._sum.quantity ?? 0) -
        (othersUsage._sum.quantity ?? 0);

      if (newQuantity > remaining) {
        throw new Error(
          `Stock insuficiente en el pool. Podés asignar hasta ${remaining} tickets a este tipo.`,
        );
      }
    }

    await tx.ticketType.update({
      where: { id: ticketTypeId },
      data: { quantity: newQuantity },
    });

    await tx.ticketStockMovement.create({
      data: {
        ticketTypeId,
        eventId: current.eventId,
        producerId,
        performedById,
        type: delta >= 0 ? "INCREASE" : "DECREASE",
        delta,
        previousQuantity,
        newQuantity,
        reason: reason ?? null,
      },
    });

    return { previousQuantity, newQuantity };
  });
}

export async function getStockMovementsByTicketType(
  ticketTypeId: string,
  take = 100,
) {
  return prisma.ticketStockMovement.findMany({
    where: { ticketTypeId },
    orderBy: { createdAt: "desc" },
    include: { performedBy: { select: { id: true, name: true } } },
    take,
  });
}
