import { prisma } from "../prisma";
import { isAfter } from "date-fns";
import { Prisma } from "@prisma/client";
import { StockSummary } from "@/types/ticket-stock";

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getTicketPackagesByProducer(producerId: string) {
  return prisma.ticketPackage.findMany({
    where: { producerId, status: { not: "CANCELED" } },
    orderBy: { purchasedAt: "desc" },
  });
}

export async function getProducerTotalPool(producerId: string): Promise<number> {
  const result = await prisma.ticketPackage.aggregate({
    _sum: { quantity: true },
    where: { producerId, status: "ACTIVE" },
  });
  return result._sum.quantity ?? 0;
}

export async function getProducerStockSummary(
  producerId: string
): Promise<StockSummary> {
  const now = new Date();

  const [packages, events, memberAllocations] = await Promise.all([
    prisma.ticketPackage.aggregate({
      _sum: { quantity: true },
      where: { producerId, status: "ACTIVE" },
    }),
    prisma.event.findMany({
      where: {
        producerId,
        status: { notIn: ["DELETED", "CANCELED"] },
      },
      select: {
        endDate: true,
        ticketTypes: {
          where: { NOT: { status: "DELETED" } },
          select: {
            quantity: true,
            orders: {
              where: { isInvitation: false },
              select: { quantity: true },
            },
          },
        },
      },
    }),
    prisma.memberTicketAllocation.aggregate({
      _sum: { quantity: true },
      where: { producerId },
    }),
  ]);

  const totalPool = packages._sum.quantity ?? 0;

  let allocatedToEvents = 0;
  for (const event of events) {
    const isActive = event.endDate === null || isAfter(event.endDate, now);
    for (const ticket of event.ticketTypes) {
      if (isActive) {
        allocatedToEvents += ticket.quantity;
      } else {
        allocatedToEvents += ticket.orders.reduce(
          (acc, o) => acc + o.quantity,
          0
        );
      }
    }
  }

  const allocatedToMembers = memberAllocations._sum.quantity ?? 0;
  const unallocated = totalPool - allocatedToEvents;

  return { totalPool, allocatedToEvents, allocatedToMembers, unallocated };
}

export async function getEventTicketAllocation(eventId: string) {
  return prisma.eventTicketAllocation.findUnique({ where: { eventId } });
}

export async function getEventAllocationsByProducer(producerId: string) {
  return prisma.eventTicketAllocation.findMany({
    where: { producerId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          endDate: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMemberTicketAllocation(userId: string) {
  return prisma.memberTicketAllocation.findUnique({ where: { userId } });
}

export async function getMemberAllocationsByProducer(producerId: string) {
  return prisma.memberTicketAllocation.findMany({
    where: { producerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Escritura ────────────────────────────────────────────────────────────────

export async function purchaseTicketPackage(data: {
  producerId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}) {
  const { producerId, quantity, unitPrice, notes } = data;
  const totalPrice = new Prisma.Decimal(unitPrice).mul(quantity);

  return prisma.ticketPackage.create({
    data: {
      producerId,
      quantity,
      unitPrice: new Prisma.Decimal(unitPrice),
      totalPrice,
      status: "ACTIVE",
      notes: notes ?? null,
    },
  });
}

export async function upsertEventTicketAllocation(data: {
  producerId: string;
  eventId: string;
  quantity: number;
}): Promise<void> {
  const { producerId, eventId, quantity } = data;

  const [summary, existing] = await Promise.all([
    getProducerStockSummary(producerId),
    getEventTicketAllocation(eventId),
  ]);

  const currentAlloc = existing?.quantity ?? 0;
  const availableForReassignment = summary.unallocated + currentAlloc;

  if (quantity > availableForReassignment) {
    throw new Error(
      `No hay suficiente stock disponible. Disponible: ${availableForReassignment}, solicitado: ${quantity}`
    );
  }

  await prisma.eventTicketAllocation.upsert({
    where: { eventId },
    create: { producerId, eventId, quantity },
    update: { quantity },
  });
}

export async function upsertMemberTicketAllocation(data: {
  producerId: string;
  userId: string;
  quantity: number;
}): Promise<void> {
  const { producerId, userId, quantity } = data;

  const [summary, existing] = await Promise.all([
    getProducerStockSummary(producerId),
    getMemberTicketAllocation(userId),
  ]);

  const currentAlloc = existing?.quantity ?? 0;
  const availableForReassignment = summary.unallocated + currentAlloc;

  if (quantity > availableForReassignment) {
    throw new Error(
      `No hay suficiente stock disponible. Disponible: ${availableForReassignment}, solicitado: ${quantity}`
    );
  }

  await prisma.memberTicketAllocation.upsert({
    where: { userId },
    create: { producerId, userId, quantity },
    update: { quantity },
  });
}

export async function removeEventTicketAllocation(eventId: string) {
  return prisma.eventTicketAllocation.delete({ where: { eventId } });
}

// ─── Disponibilidad por evento ─────────────────────────────────────────────────

/**
 * Retorna los tickets restantes para crear en un evento dado.
 * - Si el evento tiene una asignación específica (EventTicketAllocation):
 *   devuelve `asignación - tickets ya creados` para ese evento.
 * - Si no tiene asignación: devuelve el stock no asignado de la productora.
 */
export async function getRemainingTicketsForEvent(
  eventId: string,
  producerId: string
): Promise<number> {
  const [eventAllocation, existing] = await Promise.all([
    getEventTicketAllocation(eventId),
    prisma.ticketType.aggregate({
      _sum: { quantity: true },
      where: { eventId, NOT: { status: "DELETED" } },
    }),
  ]);

  const usedForEvent = existing._sum.quantity ?? 0;

  if (eventAllocation) {
    return Math.max(0, eventAllocation.quantity - usedForEvent);
  }

  // Sin asignación específica al evento → usar el pool libre de la productora
  const summary = await getProducerStockSummary(producerId);
  return summary.unallocated;
}

export async function removeMemberTicketAllocation(userId: string) {
  return prisma.memberTicketAllocation.delete({ where: { userId } });
}
