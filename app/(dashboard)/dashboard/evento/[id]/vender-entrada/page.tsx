import BuyTicketForm from "@/components/dashboard/buy-ticket-form";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";

import { getSingleEventById, getSoldTicketsByType } from "@/lib/actions";
import { getCashPaymentMethodIdByEvent } from "@/lib/api/payment-methods";
import { DiscountCode } from "@/types/discount-code";
import { ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";
import React from "react";

async function getEventData(id: string) {
  const evento = await getSingleEventById(id);
  if (!evento) return;
  const serviceCharge = evento.producer?.configuration?.serviceCharge || 0;

  const [soldTickets, cashPaymentMethodId] = await Promise.all([
    getSoldTicketsByType(evento.id),
    getCashPaymentMethodIdByEvent(id),
  ]);
  return {
    evento,
    serviceCharge,
    soldTickets,
    cashPaymentMethodId,
  };
}

export default async function NewCashTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventData = await getEventData(id);
  if (!eventData) {
    return <p>Evento no encontrado.</p>;
  }
  const { evento, serviceCharge, soldTickets, cashPaymentMethodId } = eventData;
  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader
          title={`Vender entrada para: ${evento.title}`}
          subtitle="Completa el formulario para emitir un ticket cobrando en efectivo."
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
          <BuyTicketForm
            tickets={evento.ticketTypes?.map((t) => ({
              ...t,
              price: Number(t.price),
              discount: t.discount !== null ? Number(t.discount) : null,
            }))}
            eventId={evento.id}
            soldTickets={soldTickets}
            discountCode={
              evento?.discountCode &&
              (evento.discountCode as DiscountCode[]).filter(
                (dc) => dc.status !== "DELETED"
              ).length > 0
                ? (evento.discountCode as DiscountCode[]).filter(
                    (dc) => dc.status !== "DELETED"
                  )
                : undefined
            }
            serviceCharge={serviceCharge || undefined}
            cashPaymentMethodId={cashPaymentMethodId ?? undefined}
          />
        </div>
      </div>
    </>
  );
}
