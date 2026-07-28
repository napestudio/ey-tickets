import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import { StockSummary, ProfitReport, EventProfitRow } from "@/types/ticket-stock";

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
    where: { producerId, status: "ACTIVE", paymentStatus: "PAID" },
  });
  return result._sum.quantity ?? 0;
}

export async function getProducerStockSummary(
  producerId: string
): Promise<StockSummary> {
  const [packages, ticketTypesUsage, memberAllocations, soldOrders] =
    await Promise.all([
      prisma.ticketPackage.aggregate({
        _sum: { quantity: true },
        where: { producerId, status: "ACTIVE", paymentStatus: "PAID" },
      }),
      prisma.ticketType.aggregate({
        _sum: { quantity: true },
        where: {
          event: { producerId },
          NOT: { status: "DELETED" },
        },
      }),
      prisma.memberTicketAllocation.aggregate({
        _sum: { quantity: true },
        where: { producerId },
      }),
      prisma.order.aggregate({
        _sum: { quantity: true },
        where: {
          status: "PAID",
          isInvitation: false,
          event: { producerId },
        },
      }),
    ]);

  const totalPool = packages._sum.quantity ?? 0;
  const usedByTicketTypes = ticketTypesUsage._sum.quantity ?? 0;
  const allocatedToMembers = memberAllocations._sum.quantity ?? 0;
  const soldTickets = soldOrders._sum.quantity ?? 0;
  const available = totalPool - usedByTicketTypes - allocatedToMembers;

  return { totalPool, usedByTicketTypes, allocatedToMembers, available, soldTickets };
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

export async function createPendingTicketPackage(data: {
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
      paymentStatus: "PENDING",
      notes: notes ?? null,
    },
  });
}

export async function confirmTicketPackagePurchase(
  packageId: string,
  mpData: {
    mpPaymentId: string;
    mpDateApproved: Date | null;
    mpPaymentMethodId: string | null;
    mpPaymentTypeId: string | null;
    mpInstallments: number | null;
    mpAuthorizationCode: string | null;
    mpTransactionAmount: number | null;
    mpNetReceivedAmount: number | null;
    mpFeeAmount: number | null;
    mpCurrencyId: string | null;
    mpRawResponse: object;
  }
) {
  return prisma.ticketPackage.update({
    where: { id: packageId },
    data: {
      paymentStatus: "PAID",
      mpPaymentId: mpData.mpPaymentId,
      mpDateApproved: mpData.mpDateApproved,
      mpPaymentMethodId: mpData.mpPaymentMethodId,
      mpPaymentTypeId: mpData.mpPaymentTypeId,
      mpInstallments: mpData.mpInstallments,
      mpAuthorizationCode: mpData.mpAuthorizationCode,
      mpTransactionAmount: mpData.mpTransactionAmount
        ? new Prisma.Decimal(mpData.mpTransactionAmount)
        : null,
      mpNetReceivedAmount: mpData.mpNetReceivedAmount
        ? new Prisma.Decimal(mpData.mpNetReceivedAmount)
        : null,
      mpFeeAmount: mpData.mpFeeAmount
        ? new Prisma.Decimal(mpData.mpFeeAmount)
        : null,
      mpCurrencyId: mpData.mpCurrencyId,
      mpRawResponse: mpData.mpRawResponse,
    },
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
  const availableForReassignment = summary.available + currentAlloc;

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

// ─── Disponibilidad ────────────────────────────────────────────────────────────

/**
 * Retorna los tickets disponibles para agregar a tipos de ticket de un evento.
 * Equivale al pool disponible total de la productora (sin ningún tope por evento).
 */
export async function getRemainingTicketsForEvent(
  _eventId: string,
  producerId: string
): Promise<number> {
  const summary = await getProducerStockSummary(producerId);
  return Math.max(0, summary.available);
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
