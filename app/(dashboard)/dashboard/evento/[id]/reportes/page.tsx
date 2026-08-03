import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import {
  getEventDetailedStats,
  getEventDetailedStatsForMember,
} from "@/lib/api/reportes";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2 } from "lucide-react";
import EventStatsSummary from "@/app/(dashboard)/dashboard/reportes/[eventId]/components/event-stats-summary";
import ExportCsvButton from "@/app/(dashboard)/dashboard/reportes/[eventId]/components/export-csv-button";

interface EventSimpleReportPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventSimpleReportPage({
  params,
}: EventSimpleReportPageProps) {
  const session = await getSession();
  if (!session) return null;

  const { role, producerId, id: userId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const { id: eventId } = await params;
  const pid = producerId!;

  const stats =
    isOrgAdmin(role) || role === "SUPERADMIN"
      ? await getEventDetailedStats(eventId, pid)
      : await getEventDetailedStatsForMember(eventId, pid, userId);

  if (!stats) redirect(`/dashboard/evento/${eventId}`);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <Link href={`/dashboard/evento/${eventId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al evento
            </Link>
          </Button>
          <DashboardHeader title="Reportes" subtitle={stats.eventTitle} />
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton stats={stats} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/reportes/${eventId}`}>
              <BarChart2 className="mr-2 h-4 w-4" />
              Ver reporte detallado
            </Link>
          </Button>
        </div>
      </div>

      <EventStatsSummary stats={stats} />

    </div>
  );
}
