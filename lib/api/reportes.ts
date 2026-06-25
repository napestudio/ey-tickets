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
      discountedOrders,
      hourlyRaw,
      dailyRaw,
      weekdayRaw,
      eventPayments,
      revenueByPaymentMethodRaw,
    ] = await Promise.all([
      // 1. Event metadata + access guard (producerId ensures ownership)
      prisma.event.findUnique({
        where: { id: eventId, producerId },
        select: { id: true, title: true, status: true },
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
      // 4. Total number of orders
      prisma.order.count({
        where: { eventId, status: "PAID", isInvitation: false },
      }),
      // 5. Sales grouped by ticket type
      prisma.order.groupBy({
        by: ["ticketTypeId"],
        _sum: { totalPrice: true, quantity: true },
        where: { eventId, status: "PAID", isInvitation: false },
      }),
      // 6. Validated tickets (attended)
      prisma.ticketOrder.count({
        where: {
          eventId,
          status: "VALIDATED",
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
    ]);

    if (!event) return null;

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
    const averageTicketPrice =
      totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    const attendanceRate =
      totalTicketsSold > 0
        ? (validatedTickets / totalTicketsSold) * 100
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
      totalOrders,
      totalTicketsSold,
      averageTicketPrice,
      validatedTickets,
      attendanceRate,
      discountedOrders,
      totalRevenue,
      estimatedCost,
      profit,
      margin,
      wac,
      ticketTypeBreakdown,
      hourlySales,
      dailySales,
      weekdaySales,
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
