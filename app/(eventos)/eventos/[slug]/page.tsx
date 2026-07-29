import { getSingleEventBySlug, getSoldTicketsByType } from "@/lib/actions";
import { datesFormater } from "@/lib/utils";
import TicketTypePicker from "@/components/ticket-type-picker/ticket-type-picker";
import EventHeader from "@/components/event-header/event-header";
import { DiscountCode } from "@/types/discount-code";

import { Metadata, ResolvingMetadata } from "next";
import { GetSingleEventResponse } from "@/lib/api/eventos";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { EventDescription } from "@/components/dashboard/event-description";
import EventsMarquee from "@/components/website/events/EventsMarquee";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const param = await params;
  const eventData = await getEventData(param.slug);
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

async function getEventData(slug: string) {
  const evento = await getSingleEventBySlug(slug);

  if (!evento) return;
  const serviceCharge = evento.producer?.configuration?.serviceCharge || 0;
  const soldTickets = await getSoldTicketsByType(evento.tickets);
  const paymentMethod = evento.eventPayments;

  return {
    evento,
    serviceCharge,
    soldTickets,
    paymentMethod,
  };
}

export default async function Evento({ params }: { params: { slug: string } }) {
  const param = await params;
  const eventData = await getEventData(param.slug);
  if (!eventData) {
    return <p>Evento no encontrado.</p>;
  }

  const { evento, serviceCharge, soldTickets, paymentMethod } = eventData;

  const groupedDates = datesFormater(evento?.dates as string);
  const { title, dates, city, state } = evento;

  return (
    <>
      <EventsMarquee events={Array(6).fill({ title, dates, city, state })} />
      <div className="min-h-svh bg-linear-to-t to-black from-ey-turquoise-darker to-80% text-white">
        <div className="w-200 max-w-[90vw] mx-auto px-6 md:px-10 pt-8">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a eventos
          </Link>
        </div>

        <EventHeader
          evento={evento as GetSingleEventResponse}
          dates={groupedDates}
        />

        <section className="w-200 max-w-[90vw] mx-auto p-6 pt-14 md:py-12 md:px-10 z-10 relative">
          {paymentMethod.length > 0 && (
            <>
              <h2 className="m-4 scroll-m-20 text-4xl tracking-tight lg:text-7xl text-white text-stroke text-center">
                <span className="font-bold">Comprá tu </span>
                <span className="font-thin">entrada</span>
              </h2>
              <div className="md:flex md:w-full max-w-[90vw] mx-auto align-center justify-center flex-1">
                {evento?.ticketTypes && (
                  <TicketTypePicker
                    tickets={evento.ticketTypes.map((t) => ({
                      ...t,
                      price: Number(t.price),
                      discount: t.discount !== null ? Number(t.discount) : null,
                    }))}
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

          {evento?.ageRestriction && (
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-4 py-3 my-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                {evento?.ageRestriction}+
              </div>
              <p className="text-sm text-neutral-400">
                Edad mínima para ingresar al evento
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 my-4">
            <ul className="flex flex-wrap gap-2">
              {evento?.restrictions?.map((tag) => (
                <li
                  key={tag}
                  className="inline-block bg-ey-turquoise text-gray-800 text-sm font-semibold mr-2 px-5 py-2.5 rounded"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 text-[.5rem] font-medium text-neutral-400 text-balance">
            <EventDescription html={evento?.legalText ?? ""} />
          </div>
        </section>
      </div>
    </>
  );
}
