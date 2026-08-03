import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import {
  getEventListForReports,
  getEventListForReportsForMember,
} from "@/lib/api/reportes";
import { redirect } from "next/navigation";
import EventReportList from "./components/event-report-list";

export default async function ReportesPage() {
  const session = await getSession();
  if (!session) return;

  const { role, producerId, id: userId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const events =
    isOrgAdmin(role) || role === "SUPERADMIN"
      ? await getEventListForReports(pid)
      : await getEventListForReportsForMember(pid, userId);

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Reportes"
        subtitle="Seleccioná un evento para ver su análisis detallado"
      />
      <EventReportList events={events} />
    </div>
  );
}
