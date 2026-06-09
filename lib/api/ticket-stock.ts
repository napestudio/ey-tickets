import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import { StockSummary, ProfitReport, EventProfitRow, AllocationWithUsage } from "@/types/ticket-stock";

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
  // Paso 1 — paralelo: pool total + asignaciones explícitas + cuotas de miembros
  const [packages, eventAllocations, memberAllocations] = await Promise.all([
    prisma.ticketPackage.aggregate({
      _sum: { quantity: true },
      where: { producerId, status: "ACTIVE" },
    }),
    prisma.eventTicketAllocation.findMany({
      where: { producerId },
      select: { quantity: true, eventId: true },
    }),
    prisma.memberTicketAllocation.aggregate({
      _sum: { quantity: true },
      where: { producerId },
    }),
  ]);

  const totalPool = packages._sum.quantity ?? 0;
  const allocatedEventIds = eventAllocations.map((a) => a.eventId);
  // Eventos CON asignación explícita: contar el tope comprometido
  const allocatedToEvents = eventAllocations.reduce((acc, a) => acc + a.quantity, 0);

  // Paso 2 — eventos SIN asignación explícita: contar su uso real de TicketTypes
  const nonAllocatedResult = await prisma.ticketType.aggregate({
    _sum: { quantity: true },
    where: {
      event: {
        producerId,
        status: { notIn: ["DELETED", "CANCELED"] },
      },
      NOT: [
        { status: "DELETED" },
        ...(allocatedEventIds.length > 0
          ? [{ eventId: { in: allocatedEventIds } }]
          : []),
      ],
    },
  });
  const nonAllocatedUsage = nonAllocatedResult._sum.quantity ?? 0;

  const allocatedToMembers = memberAllocations._sum.quantity ?? 0;
  const unallocated = totalPool - allocatedToEvents - nonAllocatedUsage;

  return { totalPool, allocatedToEvents, allocatedToMembers, unallocated };
}

export async function getEventTicketAllocation(eventId: string) {
  return prisma.eventTicketAllocation.findUnique({ where: { eventId } });
}

export async function getEventStockDetails(eventId: string) {
  const allocation = await prisma.eventTicketAllocation.findUnique({ where: { eventId } });
  if (!allocation) return null;

  const [ticketTypesResult, soldResult] = await Promise.all([
    prisma.ticketType.aggregate({
      _sum: { quantity: true },
      where: { eventId, NOT: { status: "DELETED" } },
    }),
    prisma.order.aggregate({
      _sum: { quantity: true },
      where: { eventId, status: "PAID", isInvitation: false },
    }),
  ]);

  const assignedToTypes = ticketTypesResult._sum.quantity ?? 0;
  const sold = soldResult._sum.quantity ?? 0;

  return {
    quantity: allocation.quantity,
    assignedToTypes,
    available: Math.max(0, allocation.quantity - assignedToTypes),
    sold,
  };
}

export async function getEventAllocationsByProducer(
  producerId: string
): Promise<AllocationWithUsage[]> {
  const allocations = await prisma.eventTicketAllocation.findMany({
    where: { producerId },
    include: {
      event: {
        select: { id: true, title: true, endDate: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const eventIds = allocations.map((a) => a.eventId);

  if (eventIds.length === 0) return [];

  const [ticketTypeAggs, orderAggs] = await Promise.all([
    prisma.ticketType.groupBy({
      by: ["eventId"],
      _sum: { quantity: true },
      where: { eventId: { in: eventIds }, NOT: { status: "DELETED" } },
    }),
    prisma.order.groupBy({
      by: ["eventId"],
      _sum: { quantity: true },
      where: { eventId: { in: eventIds }, status: "PAID", isInvitation: false },
    }),
  ]);

  const ticketTypeMap = new Map(
    ticketTypeAggs.map((r) => [r.eventId, r._sum.quantity ?? 0])
  );
  const orderMap = new Map(
    orderAggs.map((r) => [r.eventId, r._sum.quantity ?? 0])
  );

  return allocations.map((alloc) => ({
    ...alloc,
    ticketTypesQuantity: ticketTypeMap.get(alloc.eventId) ?? 0,
    ticketsSold: orderMap.get(alloc.eventId) ?? 0,
  }));
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

  const [summary, existing, ticketTypeUsage] = await Promise.all([
    getProducerStockSummary(producerId),
    getEventTicketAllocation(eventId),
    prisma.ticketType.aggregate({
      _sum: { quantity: true },
      where: { eventId, NOT: { status: "DELETED" } },
    }),
  ]);

  const minAllowed = ticketTypeUsage._sum.quantity ?? 0;
  if (quantity < minAllowed) {
    throw new Error(
      `No se puede asignar menos de ${minAllowed} tickets. Los tipos de ticket existentes consumen ese total.`
    );
  }

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
  const ticketTypeUsage = await prisma.ticketType.aggregate({
    _sum: { quantity: true },
    where: { eventId, NOT: { status: "DELETED" } },
  });

  if ((ticketTypeUsage._sum.quantity ?? 0) > 0) {
    throw new Error(
      "No se puede eliminar la asignación mientras existan tipos de tickets activos en el evento.",
    );
  }

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

  // Sin asignación explícita → el evento no puede crear tipos de tickets
  return 0;
}

export async function removeMemberTicketAllocation(userId: string) {
  return prisma.memberTicketAllocation.delete({ where: { userId } });
}

// ─── Reporte de ganancias ──────────────────────────────────────────────────────

export const getProfitReport = cache(
  async (producerId: string): Promise<ProfitReport> => {
    const [packageGroups, orderGroups, events] = await Promise.all([
      // Query A: paquetes agrupados por status → WAC + pool ACTIVE en una sola query
      prisma.ticketPackage.groupBy({
        by: ["status"],
        _sum: { quantity: true, totalPrice: true },
        where: { producerId, status: { not: "CANCELED" } },
      }),
      // Query B: ventas PAID agrupadas por evento (excluye invitaciones)
      prisma.order.groupBy({
        by: ["eventId"],
        _sum: { totalPrice: true, quantity: true },
        where: {
          status: "PAID",
          isInvitation: false,
          event: { producerId },
        },
      }),
      // Query C: metadata de eventos del productor
      prisma.event.findMany({
        where: { producerId, status: { not: "DELETED" } },
        select: { id: true, title: true, status: true },
      }),
    ]);

    // Calcular WAC y totalPool desde los grupos de paquetes
    let totalPool = 0;
    let wacNumerator = 0;
    let wacDenominator = 0;
    let totalPackageCost = 0;

    for (const group of packageGroups) {
      const qty = group._sum.quantity ?? 0;
      const cost = parseFloat((group._sum.totalPrice ?? 0).toString());
      wacNumerator += cost;
      wacDenominator += qty;
      totalPackageCost += cost;
      if (group.status === "ACTIVE") {
        totalPool = qty;
      }
    }

    const wac = wacDenominator > 0 ? wacNumerator / wacDenominator : 0;

    // Join en memoria: construir mapa de ventas por eventId
    const salesMap = new Map<string, { revenue: number; ticketsSold: number }>();
    for (const order of orderGroups) {
      salesMap.set(order.eventId, {
        revenue: parseFloat((order._sum.totalPrice ?? 0).toString()),
        ticketsSold: order._sum.quantity ?? 0,
      });
    }

    // Construir filas por evento
    const eventRows: EventProfitRow[] = events.map((event) => {
      const sales = salesMap.get(event.id) ?? { revenue: 0, ticketsSold: 0 };
      const estimatedCost = sales.ticketsSold * wac;
      const profit = sales.revenue - estimatedCost;
      const margin =
        sales.revenue > 0 ? (profit / sales.revenue) * 100 : null;

      return {
        eventId: event.id,
        eventTitle: event.title,
        eventStatus: event.status,
        ticketsSold: sales.ticketsSold,
        revenue: sales.revenue,
        estimatedCost,
        profit,
        margin,
      };
    });

    // Totales del productor
    const totalTicketsSold = eventRows.reduce(
      (acc, r) => acc + r.ticketsSold,
      0
    );
    const totalRevenue = eventRows.reduce((acc, r) => acc + r.revenue, 0);
    const totalEstimatedCost = totalTicketsSold * wac;
    const totalProfit = totalRevenue - totalEstimatedCost;
    const totalMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;
    const inventoryValue = Math.max(0, totalPool - totalTicketsSold) * wac;

    return {
      wac,
      totalPackageCost,
      totalPool,
      totalTicketsSold,
      totalRevenue,
      totalEstimatedCost,
      inventoryValue,
      totalProfit,
      totalMargin,
      events: eventRows,
    };
  }
);

/**
 * Versión de getProfitReport filtrada por membresía de evento.
 * Usada para MANAGER: solo ve los eventos donde es EventMember explícito.
 * Los totales del productor (WAC, pool) se omiten ya que no tiene acceso global.
 */
export async function getProfitReportForMember(
  producerId: string,
  userId: string
): Promise<ProfitReport> {
  // Obtener solo los eventos donde el usuario es miembro
  const memberEvents = await prisma.eventMember.findMany({
    where: { userId, event: { producerId } },
    select: { eventId: true },
  });

  const eventIds = memberEvents.map((m) => m.eventId);

  const [packageGroups, orderGroups, events] = await Promise.all([
    // WAC global del productor (necesario para calcular costo estimado)
    prisma.ticketPackage.groupBy({
      by: ["status"],
      _sum: { quantity: true, totalPrice: true },
      where: { producerId, status: { not: "CANCELED" } },
    }),
    // Ventas filtradas a los eventos del miembro
    prisma.order.groupBy({
      by: ["eventId"],
      _sum: { totalPrice: true, quantity: true },
      where: {
        status: "PAID",
        isInvitation: false,
        eventId: { in: eventIds },
      },
    }),
    // Metadata solo de los eventos del miembro
    prisma.event.findMany({
      where: { id: { in: eventIds }, status: { not: "DELETED" } },
      select: { id: true, title: true, status: true },
    }),
  ]);

  // Calcular WAC desde los paquetes del productor
  let totalPool = 0;
  let wacNumerator = 0;
  let wacDenominator = 0;
  let totalPackageCost = 0;

  for (const group of packageGroups) {
    const qty = group._sum.quantity ?? 0;
    const cost = parseFloat((group._sum.totalPrice ?? 0).toString());
    wacNumerator += cost;
    wacDenominator += qty;
    totalPackageCost += cost;
    if (group.status === "ACTIVE") {
      totalPool = qty;
    }
  }

  const wac = wacDenominator > 0 ? wacNumerator / wacDenominator : 0;

  // Join en memoria: mapa de ventas por eventId
  const salesMap = new Map<string, { revenue: number; ticketsSold: number }>();
  for (const order of orderGroups) {
    salesMap.set(order.eventId, {
      revenue: parseFloat((order._sum.totalPrice ?? 0).toString()),
      ticketsSold: order._sum.quantity ?? 0,
    });
  }

  // Construir filas por evento
  const eventRows: EventProfitRow[] = events.map((event) => {
    const sales = salesMap.get(event.id) ?? { revenue: 0, ticketsSold: 0 };
    const estimatedCost = sales.ticketsSold * wac;
    const profit = sales.revenue - estimatedCost;
    const margin =
      sales.revenue > 0 ? (profit / sales.revenue) * 100 : null;

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventStatus: event.status,
      ticketsSold: sales.ticketsSold,
      revenue: sales.revenue,
      estimatedCost,
      profit,
      margin,
    };
  });

  // Totales parciales (solo de los eventos del miembro)
  const totalTicketsSold = eventRows.reduce((acc, r) => acc + r.ticketsSold, 0);
  const totalRevenue = eventRows.reduce((acc, r) => acc + r.revenue, 0);
  const totalEstimatedCost = totalTicketsSold * wac;
  const totalProfit = totalRevenue - totalEstimatedCost;
  const totalMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : null;
  const inventoryValue = Math.max(0, totalPool - totalTicketsSold) * wac;

  return {
    wac,
    totalPackageCost,
    totalPool,
    totalTicketsSold,
    totalRevenue,
    totalEstimatedCost,
    inventoryValue,
    totalProfit,
    totalMargin,
    events: eventRows,
  };
}
