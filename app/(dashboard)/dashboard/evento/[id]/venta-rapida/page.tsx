import DashboardHeader from "@/components/dashboard/dashboard-header";
import QuickSaleForm from "@/components/dashboard/quick-sale-form";
import { Button } from "@/components/ui/button";
import { getEventById, getSoldTicketsByType } from "@/lib/actions";
import { getCashPaymentMethodIdByEvent } from "@/lib/api/payment-methods";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getPageData(id: string) {
  const evento = await getEventById(id);
  if (!evento) return null;

  const [soldTickets, cashPaymentMethodId] = await Promise.all([
    getSoldTicketsByType(evento.id),
    getCashPaymentMethodIdByEvent(id),
  ]);

  return { evento, soldTickets, cashPaymentMethodId };
}

export default async function VentaRapidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPageData(id);

  if (!data) {
    return <p>Evento no encontrado.</p>;
  }

  const { evento, soldTickets, cashPaymentMethodId } = data;

  const tickets = (evento.ticketTypes ?? [])
    .filter((t) => t.status !== "DELETED" && t.status !== "INACTIVE")
    .map((t) => ({
      ...t,
      price: Number(t.price),
      discount: t.discount !== null ? Number(t.discount) : null,
    }));

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader
        title={`Venta Rápida: ${evento.title}`}
        subtitle="Emití entradas en la puerta sin datos personales del comprador."
      />
      <div className="flex items-center justify-between gap-2 mt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/evento/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Evento
          </Link>
        </Button>
      </div>

      <div className="w-full space-y-5">
        <QuickSaleForm
          tickets={tickets}
          eventId={evento.id}
          eventTitle={evento.title}
          soldTickets={soldTickets}
          cashPaymentMethodId={cashPaymentMethodId ?? undefined}
        />
      </div>
    </div>
  );
}
