import { prisma } from "../prisma";
import { cache } from "react";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";
import type {
  EventDetailedStats,
  TicketTypeBreakdown,
  HourlySalesPoint,
  DailySalesPoint,
  WeekdaySalesPoint,
  PaymentMethodInfo,
  ValidationHourlyPoint,
  ValidatorTokenBreakdown,
} from "@/types/reportes";

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type RevenueByPaymentMethodRow = {
  paymentMethodId: string | null;
  order_count: bigint;
  revenue: number;
};

type HourlyRawRow = {
  hour: number;
  order_count: bigint;
  tickets_sold: bigint;
  revenue: number;
};

type DailyRawRow = {
  date: string;
  order_count: bigint;
  tickets_sold: bigint;
  revenue: number;
};

type WeekdayRawRow = {
  weekday: number;
  order_count: bigint;
  tickets_sold: bigint;
};

type ValidationHourlyRawRow = {
  hour: number;
  validated_count: bigint;
};

export const getEventDetailedStats = cache(
  async (
    eventId: string,
    producerId: string
  ): Promise<EventDetailedStats | null> => {
    const [
      event,
      packageGroups,
      totalSales,
      totalOrders,
      ordersByTicketType,
      validatedTickets,
      ticketOrdersIssued,
      discountedOrders,
      invitationTicketOrdersIssued,
      hourlyRaw,
      dailyRaw,
      weekdayRaw,
      eventPayments,
      revenueByPaymentMethodRaw,
      financialTotals,
      validationHourlyRaw,
      validatedWithSession,
    ] = await Promise.all([
      // 1. Event metadata + access guard (producerId ensures ownership)
      prisma.event.findUnique({
        where: { id: eventId, producerId },
        select: { id: true, title: true, status: true, dates: true },
      }),
      // 2. Ticket packages → WAC calculation (same pattern as getProfitReport)
      prisma.ticketPackage.groupBy({
        by: ["status"],
        _sum: { quantity: true, totalPrice: true },
        where: { producerId, status: { not: "CANCELED" } },
      }),
      // 3. Total sales for this event
      prisma.order.aggregate({
        _sum: { totalPrice: true, quantity: true },
        where: { eventId, status: "PAID", isInvitation: false },
      }),
      // 4. Total number of orders. The system creates an Order for every
      // ticket issued — sold or invited — so this counts both (per business
      // rule: "Órdenes totales son todas las órdenes completadas").
      prisma.order.count({
        where: { eventId, status: "PAID" },
      }),
      // 5. Sales grouped by ticket type
      prisma.order.groupBy({
        by: ["ticketTypeId"],
        _sum: { totalPrice: true, quantity: true },
        where: { eventId, status: "PAID", isInvitation: false },
      }),
      // 6. Validated tickets (attended). Counts every scanned QR regardless
      // of whether the order was sold or invited — validators at the door
      // don't distinguish, so this must include invitations too.
      prisma.ticketOrder.count({
        where: {
          eventId,
          status: "VALIDATED",
          order: { status: "PAID" },
        },
      }),
      // 6b. Physical (paid, non-invitation) tickets issued — one TicketOrder
      // per event date per unit purchased, so an event with 2 dates yields 2
      // TicketOrders per unit sold. This is what "Tickets vendidos" means in
      // this report: every QR that was paid for, not the purchase-order
      // quantity (an order with 3 entradas across 2 dates issues 6 QRs).
      prisma.ticketOrder.count({
        where: {
          eventId,
          order: { status: "PAID", isInvitation: false },
        },
      }),
      // 7. Orders that used a discount code or promotion
      prisma.order.count({
        where: {
          eventId,
          status: "PAID",
          isInvitation: false,
          OR: [{ hasCode: true }, { hasPromo: true }],
        },
      }),
      // 7b. Physical QRs issued for invitations (same one-per-date-per-unit
      // rule as 6b). This — not a sum of Order.quantity — is what
      // "Invitaciones" means in this report: every QR issued from
      // add-invitation-dialog.
      prisma.ticketOrder.count({
        where: {
          eventId,
          order: { status: "PAID", isInvitation: true },
        },
      }),
      // 8. Sales by hour of day (Argentina timezone)
      // Column names use camelCase because no @map is set on Order fields
      prisma.$queryRaw<HourlyRawRow[]>`
        SELECT
          EXTRACT(HOUR FROM "createdAt" AT TIME ZONE ${DEFAULT_TIMEZONE})::int AS hour,
          COUNT(*) AS order_count,
          SUM(quantity) AS tickets_sold,
          COALESCE(SUM(CAST("totalPrice" AS FLOAT8)), 0) AS revenue
        FROM orders
        WHERE "eventId" = ${eventId}
          AND status = 'PAID'
          AND "isInvitation" = false
        GROUP BY hour
        ORDER BY hour
      `,
      // 9. Sales by calendar day (Argentina timezone)
      prisma.$queryRaw<DailyRawRow[]>`
        SELECT
          TO_CHAR(DATE("createdAt" AT TIME ZONE ${DEFAULT_TIMEZONE}), 'YYYY-MM-DD') AS date,
          COUNT(*) AS order_count,
          SUM(quantity) AS tickets_sold,
          COALESCE(SUM(CAST("totalPrice" AS FLOAT8)), 0) AS revenue
        FROM orders
        WHERE "eventId" = ${eventId}
          AND status = 'PAID'
          AND "isInvitation" = false
        GROUP BY date
        ORDER BY date
      `,
      // 10. Sales by day of week (0=Sunday, 6=Saturday)
      prisma.$queryRaw<WeekdayRawRow[]>`
        SELECT
          EXTRACT(DOW FROM "createdAt" AT TIME ZONE ${DEFAULT_TIMEZONE})::int AS weekday,
          COUNT(*) AS order_count,
          SUM(quantity) AS tickets_sold
        FROM orders
        WHERE "eventId" = ${eventId}
          AND status = 'PAID'
          AND "isInvitation" = false
        GROUP BY weekday
        ORDER BY weekday
      `,
      // 11. Payment methods configured for this event
      prisma.eventPayment.findMany({
        where: { eventId },
        include: {
          paymentMethod: {
            select: {
              id: true,
              name: true,
              type: true,
              commissionPercentage: true,
            },
          },
        },
      }),
      // 12. Actual revenue grouped by paymentMethodId (null = untracked)
      prisma.$queryRaw<RevenueByPaymentMethodRow[]>`
        SELECT
          "paymentMethodId",
          COUNT(*) AS order_count,
          COALESCE(SUM(CAST("totalPrice" AS FLOAT8)), 0) AS revenue
        FROM orders
        WHERE "eventId" = ${eventId}
          AND status = 'PAID'
          AND "isInvitation" = false
        GROUP BY "paymentMethodId"
      `,
      // 13. Sum of discount amounts and service charges (from orders with new fields)
      prisma.order.aggregate({
        _sum: { discountAmount: true, serviceChargeAmount: true },
        where: { eventId, status: "PAID", isInvitation: false },
      }),
      // 14. Validations grouped by hour of day (Argentina timezone) — when
      // people actually walked in, as opposed to when they bought.
      prisma.$queryRaw<ValidationHourlyRawRow[]>`
        SELECT
          EXTRACT(HOUR FROM t."validatedAt" AT TIME ZONE ${DEFAULT_TIMEZONE})::int AS hour,
          COUNT(*) AS validated_count
        FROM ticket_orders t
        JOIN orders o ON o.id = t."orderId"
        WHERE t."eventId" = ${eventId}
          AND t.status = 'VALIDATED'
          AND t."validatedAt" IS NOT NULL
          AND o.status = 'PAID'
        GROUP BY hour
        ORDER BY hour
      `,
      // 15. Validated tickets with their validator session/token, to group
      // attendance by door/device (which ValidatorToken scanned them).
      prisma.ticketOrder.findMany({
        where: {
          eventId,
          status: "VALIDATED",
          order: { status: "PAID" },
        },
        select: {
          validatorSession: {
            select: {
              validatorToken: { select: { id: true, notes: true, token: true } },
            },
          },
        },
      }),
    ]);

    if (!event) return null;

    let eventDatesCount = 1;
    try {
      const parsedDates = event.dates ? JSON.parse(event.dates) : null;
      if (Array.isArray(parsedDates) && parsedDates.length > 0) {
        eventDatesCount = parsedDates.length;
      }
    } catch {
      eventDatesCount = 1;
    }

    // ── WAC calculation ──────────────────────────────────────────────────────
    let wacNumerator = 0;
    let wacDenominator = 0;

    for (const group of packageGroups) {
      const qty = group._sum.quantity ?? 0;
      const cost = parseFloat((group._sum.totalPrice ?? 0).toString());
      wacNumerator += cost;
      wacDenominator += qty;
    }

    const wac = wacDenominator > 0 ? wacNumerator / wacDenominator : 0;

    // ── Event totals ─────────────────────────────────────────────────────────
    const totalRevenue = parseFloat(
      (totalSales._sum.totalPrice ?? 0).toString()
    );
    const totalTicketsSold = totalSales._sum.quantity ?? 0;
    const estimatedCost = totalTicketsSold * wac;
    const profit = totalRevenue - estimatedCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : null;

    const totalDiscountsGiven = parseFloat(
      (financialTotals._sum.discountAmount ?? 0).toString()
    );
    const totalServiceCharges = parseFloat(
      (financialTotals._sum.serviceChargeAmount ?? 0).toString()
    );
    const netTicketRevenue = totalRevenue - totalServiceCharges;
    const ticketProfit = netTicketRevenue - estimatedCost;
    const averageTicketPrice =
      totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    // Invitaciones: physical QRs issued from add-invitation-dialog, not a
    // sum of Order.quantity — one QR per event date per unit invited.
    const invitationTickets = invitationTicketOrdersIssued;
    // Entradas emitidas: 100% of physical QRs for the event (sold +
    // invited), one per event date per unit — not a sum of purchase units
    // (ticketOrdersIssued/totalTicketsSold only match this when the event
    // has a single date).
    const totalTicketsIssued = ticketOrdersIssued + invitationTicketOrdersIssued;
    // Attendance is measured against every QR issued, sold or invited —
    // validators scan both the same way at the door.
    const attendanceRate =
      totalTicketsIssued > 0
        ? (validatedTickets / totalTicketsIssued) * 100
        : null;

    // ── Ticket type breakdown ────────────────────────────────────────────────
    const ticketTypeIds = ordersByTicketType.map((o) => o.ticketTypeId);
    const ticketTypes =
      ticketTypeIds.length > 0
        ? await prisma.ticketType.findMany({
            where: { id: { in: ticketTypeIds } },
            select: { id: true, title: true, type: true },
          })
        : [];

    const ttMap = new Map(ticketTypes.map((tt) => [tt.id, tt]));

    const ticketTypeBreakdown: TicketTypeBreakdown[] = ordersByTicketType
      .map((o) => {
        const tt = ttMap.get(o.ticketTypeId);
        const ticketsSold = o._sum.quantity ?? 0;
        const revenue = parseFloat((o._sum.totalPrice ?? 0).toString());
        const avgPrice = ticketsSold > 0 ? revenue / ticketsSold : 0;
        const sharePercent =
          totalTicketsSold > 0 ? (ticketsSold / totalTicketsSold) * 100 : 0;
        return {
          ticketTypeId: o.ticketTypeId,
          ticketTypeTitle: tt?.title ?? "Sin nombre",
          ticketTypeType: tt?.type ?? "NORMAL",
          ticketsSold,
          revenue,
          avgPrice,
          sharePercent,
        };
      })
      .sort((a, b) => b.ticketsSold - a.ticketsSold);

    // ── Hourly sales (BigInt → number conversion) ────────────────────────────
    const hourlySales: HourlySalesPoint[] = hourlyRaw.map((row) => ({
      hour: Number(row.hour),
      orderCount: Number(row.order_count),
      ticketsSold: Number(row.tickets_sold),
      revenue: Number(row.revenue),
    }));

    // ── Daily sales ──────────────────────────────────────────────────────────
    const dailySales: DailySalesPoint[] = dailyRaw.map((row) => ({
      date: row.date,
      orderCount: Number(row.order_count),
      ticketsSold: Number(row.tickets_sold),
      revenue: Number(row.revenue),
    }));

    const dates = dailySales.map((d) => d.date);
    const earliest = dates.length > 0 ? dates[0] : null;
    const latest = dates.length > 0 ? dates[dates.length - 1] : null;

    // ── Weekday sales (fill all 7 days, Sun→Sat) ─────────────────────────────
    const weekdayMap = new Map(
      weekdayRaw.map((row) => [Number(row.weekday), row])
    );
    const weekdaySales: WeekdaySalesPoint[] = Array.from(
      { length: 7 },
      (_, i) => {
        const row = weekdayMap.get(i);
        return {
          weekday: i,
          label: WEEKDAY_LABELS[i],
          orderCount: row ? Number(row.order_count) : 0,
          ticketsSold: row ? Number(row.tickets_sold) : 0,
        };
      }
    );

    // ── Validation hourly (when people walked in, not when they bought) ─────
    const validationHourly: ValidationHourlyPoint[] = validationHourlyRaw.map(
      (row) => ({
        hour: Number(row.hour),
        validatedCount: Number(row.validated_count),
      })
    );

    // ── Validation by token/door (query 15) ──────────────────────────────────
    const tokenCounts = new Map<string, { label: string; count: number }>();
    let validatedWithoutSession = 0;
    for (const t of validatedWithSession) {
      const token = t.validatorSession?.validatorToken;
      if (!token) {
        validatedWithoutSession++;
        continue;
      }
      const existing = tokenCounts.get(token.id);
      if (existing) {
        existing.count++;
      } else {
        tokenCounts.set(token.id, {
          label: token.notes || `Token ${token.token.slice(0, 8)}`,
          count: 1,
        });
      }
    }
    const validationByToken: ValidatorTokenBreakdown[] = Array.from(
      tokenCounts.entries()
    )
      .map(([tokenId, { label, count }]) => ({
        tokenId,
        label,
        validatedCount: count,
      }))
      .sort((a, b) => b.validatedCount - a.validatedCount);
    if (validatedWithoutSession > 0) {
      validationByToken.push({
        tokenId: "none",
        label: "Sin validador asignado",
        validatedCount: validatedWithoutSession,
      });
    }

    // ── Actual revenue per payment method (from query 12) ────────────────────
    const revenueByPmMap = new Map<string | null, { revenue: number; orders: number }>();
    for (const row of revenueByPaymentMethodRaw) {
      revenueByPmMap.set(row.paymentMethodId, {
        revenue: Number(row.revenue),
        orders: Number(row.order_count),
      });
    }

    const untrackedEntry = revenueByPmMap.get(null);
    const revenueUntracked = untrackedEntry?.revenue ?? 0;
    const ordersUntracked = untrackedEntry?.orders ?? 0;

    // ── Payment method commission data ────────────────────────────────────────
    const paymentMethods: PaymentMethodInfo[] = eventPayments.map((ep) => {
      const pm = ep.paymentMethod;
      const commissionPercentage = pm.commissionPercentage ?? null;

      // Actual tracked data for this method
      const tracked = revenueByPmMap.get(pm.id);
      const revenueTracked = tracked?.revenue ?? 0;
      const ordersTracked = tracked?.orders ?? 0;
      const commissionActual =
        commissionPercentage !== null
          ? revenueTracked * (commissionPercentage / 100)
          : 0;

      // Scenario: if 100% of total revenue went through this method
      const commissionCostIfAll =
        commissionPercentage !== null
          ? totalRevenue * (commissionPercentage / 100)
          : 0;
      const netProfitIfAll = profit - commissionCostIfAll;
      const marginIfAll =
        totalRevenue > 0 ? (netProfitIfAll / totalRevenue) * 100 : null;

      return {
        paymentMethodId: pm.id,
        name: pm.name ?? null,
        type: pm.type,
        commissionPercentage,
        revenueTracked,
        ordersTracked,
        commissionActual,
        commissionCostIfAll,
        netProfitIfAll,
        marginIfAll,
      };
    });

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventStatus: event.status,
      eventDatesCount,
      totalOrders,
      totalTicketsSold,
      averageTicketPrice,
      validatedTickets,
      ticketOrdersIssued,
      attendanceRate,
      invitationTickets,
      totalTicketsIssued,
      discountedOrders,
      totalRevenue,
      estimatedCost,
      profit,
      margin,
      wac,
      totalDiscountsGiven,
      totalServiceCharges,
      netTicketRevenue,
      ticketProfit,
      ticketTypeBreakdown,
      hourlySales,
      dailySales,
      weekdaySales,
      validationHourly,
      validationByToken,
      paymentMethods,
      revenueUntracked,
      ordersUntracked,
      dateRange: { earliest, latest },
    };
  }
);

/**
 * Filtered version for MANAGER role: verifies event membership before fetching.
 */
export async function getEventDetailedStatsForMember(
  eventId: string,
  producerId: string,
  userId: string
): Promise<EventDetailedStats | null> {
  const membership = await prisma.eventMember.findFirst({
    where: { eventId, userId, event: { producerId } },
  });

  if (!membership) return null;

  return getEventDetailedStats(eventId, producerId);
}

// ─── Event list for reports index ─────────────────────────────────────────────

export async function getEventListForReports(producerId: string) {
  return prisma.event.findMany({
    where: { producerId, status: { not: "DELETED" } },
    select: {
      id: true,
      title: true,
      status: true,
      dates: true,
      venue: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventListForReportsForMember(
  producerId: string,
  userId: string
) {
  const memberEvents = await prisma.eventMember.findMany({
    where: { userId, event: { producerId } },
    select: { eventId: true },
  });

  const eventIds = memberEvents.map((m) => m.eventId);

  return prisma.event.findMany({
    where: { id: { in: eventIds }, status: { not: "DELETED" } },
    select: {
      id: true,
      title: true,
      status: true,
      dates: true,
      venue: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
