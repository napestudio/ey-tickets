import { getSingleEventById, getSoldTicketsByType } from "@/lib/actions";
import { datesFormater } from "@/lib/utils";
import TicketTypePicker from "@/components/ticket-type-picker/ticket-type-picker";
import EventHeader from "@/components/event-header/event-header";

import { DiscountCode } from "@/types/discount-code";

import { Metadata, ResolvingMetadata } from "next";
import { GetSingleEventResponse } from "@/lib/api/eventos";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const param = await params;
  const eventData = await getEventData(param.id);
  if (!eventData) {
    return {
      title: "Evento no encontrado",
      description: "Este evento no está disponible.",
    };
  }

  const { evento } = eventData;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${SITE_NAME} | ${evento.title} | Entradas`,
    description: evento.description?.slice(0, 160),
    openGraph: {
      title: evento.title,
      description: evento.description,
      images: [
        {
          url: evento.image || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: evento.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: evento.title,
      description: evento.description,
      images: [evento.image || "/placeholder.svg"],
    },
  };
}

async function getEventData(id: string) {
  const evento = await getSingleEventById(id);

  if (!evento) return;
  const serviceCharge = evento.user.configuration?.serviceCharge || 0;
  const soldTickets = await getSoldTicketsByType(evento.tickets);
  const paymentMethod = evento.eventPayments;

  return {
    evento,
    serviceCharge,
    soldTickets,
    paymentMethod,
  };
}

export default async function Evento({ params }: { params: { id: string } }) {
  const param = await params;
  const eventData = await getEventData(param.id);
  if (!eventData) {
    return <p>Evento no encontrado.</p>;
  }

  const { evento, serviceCharge, soldTickets, paymentMethod } = eventData;

  const groupedDates = datesFormater(evento?.dates as string);

  return (
    <>
      <EventHeader
        evento={evento as GetSingleEventResponse}
        dates={groupedDates}
      />

      <section className="w-[50rem] max-w-[95vw] mx-auto py-6 md:py-12 mt-[3rem]">
        {paymentMethod.length > 0 && (
          <>
            <h2 className="mb-14 mt-10 scroll-m-20 text-4xl tracking-tight lg:text-7xl text-white text-stroke text-center">
              <span className="font-bold">Comprá tu </span>
              <span className="font-thin">entrada</span>
            </h2>
            <div className="md:flex w-[90vw] md:w-full max-w-[90vw] mx-auto align-center justify-center flex-1">
              {evento?.ticketTypes && (
                <TicketTypePicker
                  tickets={evento?.ticketTypes}
                  eventId={evento?.id}
                  soldTickets={soldTickets}
                  discountCode={
                    evento?.discountCode &&
                    (evento.discountCode as DiscountCode[]).filter(
                      (dc) => dc.status !== "DELETED",
                    ).length > 0
                      ? (evento.discountCode as DiscountCode[]).filter(
                          (dc) => dc.status !== "DELETED",
                        )
                      : undefined
                  }
                  serviceCharge={serviceCharge || undefined}
                />
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
