import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import {
  getEventDetailedStats,
  getEventDetailedStatsForMember,
} from "@/lib/api/reportes";
import { redirect } from "next/navigation";
import EventDetailHeader from "./components/event-detail-header";
import EventStatsTable from "@/app/(dashboard)/dashboard/evento/[id]/reportes/components/event-stats-table";
import TicketTypeBreakdownChart from "./components/ticket-type-breakdown-chart";
import DailySalesChart from "./components/daily-sales-chart";
import HourlySalesChart from "./components/hourly-sales-chart";
import WeekdaySalesChart from "./components/weekday-sales-chart";
import ValidationHourlyChart from "./components/validation-hourly-chart";
import ValidatorTokenChart from "./components/validator-token-chart";
import ExportCsvButton from "./components/export-csv-button";

interface EventReportPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventReportPage({ params }: EventReportPageProps) {
  const session = await getSession();
  if (!session) return;

  const { role, producerId, id: userId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const { eventId } = await params;
  const pid = producerId!;

  const stats =
    isOrgAdmin(role) || role === "SUPERADMIN"
      ? await getEventDetailedStats(eventId, pid)
      : await getEventDetailedStatsForMember(eventId, pid, userId);

  if (!stats) redirect("/dashboard/reportes");

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Estadísticas del evento"
        subtitle="Análisis detallado de ventas, costos y asistencia"
      />

      <div className="flex items-end justify-between gap-4">
        <EventDetailHeader
          eventTitle={stats.eventTitle}
          eventStatus={stats.eventStatus}
        />
        <ExportCsvButton stats={stats} />
      </div>

      <EventStatsTable stats={stats} />

      {stats.ticketTypeBreakdown.length > 0 && (
        <TicketTypeBreakdownChart data={stats.ticketTypeBreakdown} />
      )}

      {stats.dailySales.length > 0 && (
        <DailySalesChart data={stats.dailySales} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.hourlySales.length > 0 && (
          <HourlySalesChart data={stats.hourlySales} />
        )}
        {stats.weekdaySales.some((d) => d.ticketsSold > 0) && (
          <WeekdaySalesChart data={stats.weekdaySales} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats.validationHourly.length > 0 && (
          <ValidationHourlyChart data={stats.validationHourly} />
        )}
        {stats.validationByToken.length > 0 && (
          <ValidatorTokenChart data={stats.validationByToken} />
        )}
      </div>

    </div>
  );
}
