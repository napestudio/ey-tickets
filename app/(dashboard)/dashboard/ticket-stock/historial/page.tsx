import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getTicketPackagesByProducer } from "@/lib/api/ticket-stock";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PackageHistoryTable from "../components/package-history-table";

export default async function TicketStockHistorialPage() {
  const session = await getSession();
  if (!session) return;

  const { role, producerId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) redirect("/dashboard");

  const pid = producerId!;

  const rawPackages = await getTicketPackagesByProducer(pid);

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
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <DashboardHeader
          title="Historial de compra"
          subtitle="Todos los paquetes de tickets adquiridos."
        />
        <div className="pt-1 shrink-0">
          <Button asChild variant="outline">
            <Link href="/dashboard/ticket-stock">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al stock
            </Link>
          </Button>
        </div>
      </div>

      <PackageHistoryTable packages={packages} />
    </div>
  );
}
