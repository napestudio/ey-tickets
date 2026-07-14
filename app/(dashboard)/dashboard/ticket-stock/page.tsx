import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import {
  getProducerStockSummary,
  getTicketPackagesByProducer,
} from "@/lib/api/ticket-stock";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AcquireTicketsDialog from "./components/acquire-tickets-dialog";
import PackageHistoryTable from "./components/package-history-table";
import StockOverviewCards from "./components/stock-overview-cards";

export default async function TicketStockPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const { role, producerId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const [summary, rawPackages] = await Promise.all([
    getProducerStockSummary(pid),
    getTicketPackagesByProducer(pid),
  ]);

  // Serializar Decimal → number para poder pasar a Client Components
  const packages = rawPackages.map((pkg) => ({
    ...pkg,
    unitPrice: parseFloat(pkg.unitPrice.toString()),
    totalPrice: parseFloat(pkg.totalPrice.toString()),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <DashboardHeader
          title="Stock de Tickets"
          subtitle="Podés comprar por paquete o la cantidad que necesites. Los tipos de ticket consumen directamente del pool."
        />
        <div className="pt-1 shrink-0">
          <AcquireTicketsDialog producerId={pid} />
        </div>
      </div>

      <StockOverviewCards summary={summary} />

      <PackageHistoryTable packages={packages} />
    </div>
  );
}
