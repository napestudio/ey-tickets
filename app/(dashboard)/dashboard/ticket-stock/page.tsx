import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import {
  getProducerStockSummary,
  getTicketPackagesByProducer,
} from "@/lib/api/ticket-stock";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AcquireTicketsDialog from "./components/acquire-tickets-dialog";
import PackageHistoryTable from "./components/package-history-table";
import StockOverviewCards from "./components/stock-overview-cards";
import StockPaymentAlert from "./components/stock-payment-alert";

export default async function TicketStockPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    external_reference?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) return;

  const { role, producerId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const { status, external_reference } = await searchParams;

  // Mostrar alerta de feedback al volver desde MP Checkout Pro.
  // La validación real del pago la hace el webhook (/api/mercadopago/stock).
  // Aquí solo consultamos el estado en BD para mostrar un mensaje al usuario.
  let alertStatus: "success" | "pending" | null = null;
  if (external_reference) {
    const pkg = await prisma.ticketPackage.findFirst({
      where: { id: external_reference, producerId: pid },
      select: { paymentStatus: true },
    });

    if (pkg?.paymentStatus === "PAID") {
      alertStatus = "success";
    } else if (status === "approved" || status === "pending") {
      // El webhook aún no procesó el pago — informar que está en curso
      alertStatus = "pending";
    }
  }

  const [summary, rawPackages] = await Promise.all([
    getProducerStockSummary(pid),
    getTicketPackagesByProducer(pid),
  ]);

  // Serializar Decimal → number para poder pasar a Client Components
  const packages = rawPackages.map((pkg) => ({
    ...pkg,
    unitPrice: parseFloat(pkg.unitPrice.toString()),
    totalPrice: parseFloat(pkg.totalPrice.toString()),
    mpTransactionAmount: pkg.mpTransactionAmount
      ? parseFloat(pkg.mpTransactionAmount.toString())
      : null,
    mpNetReceivedAmount: pkg.mpNetReceivedAmount
      ? parseFloat(pkg.mpNetReceivedAmount.toString())
      : null,
    mpFeeAmount: pkg.mpFeeAmount
      ? parseFloat(pkg.mpFeeAmount.toString())
      : null,
  }));

  return (
    <div className="flex flex-col gap-8">
      {alertStatus && <StockPaymentAlert status={alertStatus} />}

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
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
