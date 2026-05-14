import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { isOrgAdmin } from "@/lib/permissions";
import {
  getProducerStockSummary,
  getTicketPackagesByProducer,
  getEventAllocationsByProducer,
  getMemberAllocationsByProducer,
} from "@/lib/api/ticket-stock";
import { getEventsByProducerId } from "@/lib/api/eventos";
import { getUsersByProducerId } from "@/lib/api/users";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StockOverviewCards from "./components/stock-overview-cards";
import PackageCatalog from "./components/package-catalog";
import EventAllocationsTable from "./components/event-allocations-table";
import MemberAllocationsTable from "./components/member-allocations-table";
import PackageHistoryTable from "./components/package-history-table";

export default async function TicketStockPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const { isSuperAdmin, producerId, role } = session.user;

  if (!isSuperAdmin && !isOrgAdmin(role)) redirect("/dashboard");
  if (!isSuperAdmin && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const [summary, rawPackages, eventAllocations, memberAllocations, events, members] =
    await Promise.all([
      getProducerStockSummary(pid),
      getTicketPackagesByProducer(pid),
      getEventAllocationsByProducer(pid),
      getMemberAllocationsByProducer(pid),
      getEventsByProducerId(pid),
      getUsersByProducerId(pid),
    ]);

  // Serializar Decimal → number para poder pasar a Client Components
  const packages = rawPackages.map((pkg) => ({
    ...pkg,
    unitPrice: parseFloat(pkg.unitPrice.toString()),
    totalPrice: parseFloat(pkg.totalPrice.toString()),
  }));

  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        title="Stock de Tickets"
        subtitle="Administrá tu inventario de entradas"
      />

      <StockOverviewCards summary={summary} />

      <PackageCatalog producerId={pid} />

      <EventAllocationsTable
        allocations={eventAllocations}
        events={events}
        producerId={pid}
        availableStock={summary.unallocated}
      />

      <MemberAllocationsTable
        allocations={memberAllocations}
        members={members}
        producerId={pid}
        availableStock={summary.unallocated}
      />

      <PackageHistoryTable packages={packages} />
    </div>
  );
}
