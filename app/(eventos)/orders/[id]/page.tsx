import UserDataForm from "@/components/client-data-form/client-data-form";
import OrderTimeOut from "@/components/order-time-out/order-time-out";
import OrderTotal from "@/components/order-total/order-total";
import EventsMarquee from "@/components/website/events/EventsMarquee";
import { getOrderById, getServiceCharge } from "@/lib/actions";
import { datesFormater } from "@/lib/utils";
import { Order } from "@/types/order";
import { TicketType } from "@/types/tickets";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  const evento = order?.event;
  let serviceCharge;
  if (evento) {
    const sC = await getServiceCharge(evento?.producerId);
    serviceCharge = sC || null;
  }
  const groupedEventDates = datesFormater(evento?.dates as string);
  const groupedTicketDates = datesFormater(order?.ticketType?.dates as string);

  const serializedOrder = order
    ? {
        ...order,
        totalPrice: order.totalPrice !== null ? Number(order.totalPrice) : null,
        subtotal: order.subtotal !== null ? Number(order.subtotal) : null,
        discountAmount:
          order.discountAmount !== null ? Number(order.discountAmount) : null,
        serviceChargeAmount:
          order.serviceChargeAmount !== null
            ? Number(order.serviceChargeAmount)
            : null,
        ticketType: order.ticketType
          ? {
              ...order.ticketType,
              price: Number(order.ticketType.price),
              discount:
                order.ticketType.discount !== null
                  ? Number(order.ticketType.discount)
                  : null,
            }
          : null,
        event: order.event
          ? {
              ...order.event,
              discountCode:
                order.event.discountCode?.map((dc) => ({
                  ...dc,
                  discount: dc.discount !== null ? Number(dc.discount) : null,
                })) ?? [],
            }
          : null,
      }
    : null;

  const { title, dates, city, state } = evento ?? {};

  if (order?.status === "EXPIRED" || order?.status === "PAID") {
    return (
      <>
        {title && (
          <EventsMarquee
            events={Array(6).fill({ title, dates, city, state })}
          />
        )}
        <div className="min-h-svh bg-linear-to-t to-black from-ey-turquoise-darker to-80% text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ey-turquoise mb-4">
              Orden vencida
            </h2>
            {evento?.slug && (
              <Link
                href={`/eventos/${evento.slug}`}
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al evento
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {title && (
        <EventsMarquee events={Array(6).fill({ title, dates, city, state })} />
      )}
      <div className="min-h-svh bg-linear-to-t to-black from-ey-turquoise-darker to-80% text-white">
        <div className="w-200 max-w-[90vw] mx-auto px-6 md:px-10 pt-8">
          {evento?.slug && (
            <Link
              href={`/eventos/${evento.slug}`}
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al evento
            </Link>
          )}
        </div>

        {/* <EventHeader
          evento={evento as GetSingleEventResponse}
          dates={groupedEventDates}
        /> */}

        <div className="w-200 max-w-[90vw] mx-auto px-6 md:px-10 pb-24 space-y-10">
          <section>
            <p className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Resumen de la orden
            </p>
            <OrderTotal
              order={serializedOrder as unknown as Order}
              groupedEventDates={groupedEventDates}
              groupedTicketDates={groupedTicketDates}
              ticketType={serializedOrder?.ticketType as unknown as TicketType}
              serviceCharge={serviceCharge || undefined}
            />
          </section>

          <section>
            <p className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Tus datos
            </p>
            <div className="bg-white/5 border border-white/10 p-6 mb-6 text-sm text-white/70">
              Una vez completados tus datos vas a poder realizar el pago. Vas a
              recibir tus entradas a tu casilla de email.
            </div>
            <OrderTimeOut order={serializedOrder as unknown as Order} />
            <div className="bg-white/5 border border-white/10 p-6 mt-6">
              <UserDataForm order={serializedOrder as unknown as Order} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
