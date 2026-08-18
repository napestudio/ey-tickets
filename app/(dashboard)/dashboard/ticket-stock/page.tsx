import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getProducerStockSummary } from "@/lib/api/ticket-stock";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import AcquireTicketsDialog from "./components/acquire-tickets-dialog";
import StockOverviewCards from "./components/stock-overview-cards";
import StockPaymentAlert from "./components/stock-payment-alert";
import GetTicketsCards from "./components/get-tickets-cards";

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

  const summary = await getProducerStockSummary(pid);

  return (
    <div className="flex flex-col gap-8">
      {alertStatus && <StockPaymentAlert status={alertStatus} />}

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <DashboardHeader
          title="Stock de Tickets"
          subtitle="Podés comprar por paquete o la cantidad que necesites. Los tipos de ticket consumen directamente del stock."
        />
      </div>

      <StockOverviewCards summary={summary} />
      <section className="p-4 border">
        <h3 className="text-xl font-bold">Adquirir tickets</h3>
        <p>
          Seleccioná un paquete o ingresá una cantidad personalizada para
          agregar tickets a tu stock.
        </p>
        <GetTicketsCards producerId={pid} />
      </section>
      <div className="flex items-center gap-2 pt-1 shrink-0">
        <Button asChild variant="outline">
          <Link href="/dashboard/ticket-stock/historial">
            <History className="h-4 w-4 mr-2" />
            Historial de compra
          </Link>
        </Button>
        {/* <AcquireTicketsDialog producerId={pid} /> */}
      </div>
    </div>
  );
}
