import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import {
  getProfitReport,
  getProfitReportForMember,
} from "@/lib/api/ticket-stock";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfitSummaryCards from "./components/profit-summary-cards";
import EventProfitTable from "./components/event-profit-table";

export default async function ReportesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const { role, producerId, id: userId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const pid = producerId!;

  // SUPERADMIN/OWNER/ADMIN: todos los eventos del productor
  // MANAGER: solo los eventos donde es EventMember
  const report =
    isOrgAdmin(role) || role === "SUPERADMIN"
      ? await getProfitReport(pid)
      : await getProfitReportForMember(pid, userId);

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Reportes"
        subtitle="Análisis de venas y costos por evento"
      />

      <ProfitSummaryCards report={report} />

      <EventProfitTable events={report.events} />
    </div>
  );
}
