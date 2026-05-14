import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import { getProfitReport } from "@/lib/api/ticket-stock";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfitSummaryCards from "./components/profit-summary-cards";
import EventProfitTable from "./components/event-profit-table";

export default async function ReportesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const { isSuperAdmin, producerId, role } = session.user;

  if (!isSuperAdmin && !isOrgAdmin(role)) redirect("/dashboard");
  if (!isSuperAdmin && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const report = await getProfitReport(pid);

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Reportes"
        subtitle="Análisis de ganancias por evento"
      />

      <ProfitSummaryCards report={report} />

      <EventProfitTable events={report.events} />
    </div>
  );
}
