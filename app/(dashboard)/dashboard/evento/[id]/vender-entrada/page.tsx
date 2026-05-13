import BuyTicketForm from "@/components/dashboard/buy-ticket-form";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";

import { getSingleEventById, getSoldTicketsByType } from "@/lib/actions";
import { DiscountCode } from "@/types/discount-code";
import { ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";
import React from "react";

async function getEventData(id: string) {
  const evento = await getSingleEventById(id);
  if (!evento) return;
  const serviceCharge = evento.user.configuration?.serviceCharge || 0;

  const soldTickets = await getSoldTicketsByType(evento.tickets);
  return {
    evento,
    serviceCharge,
    soldTickets,
  };
}

export default async function NewCashTicketPage({
  params,
}: {
  params: { id: string };
}) {
  const eventData = await getEventData(params.id);
  if (!eventData) {
    return <p>Evento no encontrado.</p>;
  }
  const { evento, serviceCharge, soldTickets } = eventData;
  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader
          title={`Vender entrada para: ${evento.title}`}
          subtitle="Completa el formulario para emitir un ticket cobrando en efectivo."
        />
        <div className="flex items-center justify-between gap-2 mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/evento/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Evento
            </Link>
          </Button>
        </div>

        <div className="w-full space-y-5">
          <BuyTicketForm
            tickets={evento?.ticketTypes}
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
          />
        </div>
      </div>
    </>
  );
}
