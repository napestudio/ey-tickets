import UserDataForm from "@/components/client-data-form/client-data-form";
import EventHeader from "@/components/event-header/event-header";
import OrderTimeOut from "@/components/order-time-out/order-time-out";
import OrderTotal from "@/components/order-total/order-total";
import {
  getOrderById,
  getServiceCharge,
  getTyicketTypeById,
} from "@/lib/actions";
import { GetSingleEventResponse } from "@/lib/api/eventos";
import { datesFormater } from "@/lib/utils";
import { Order } from "@/types/order";
import { TicketType } from "@/types/tickets";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  const ticketType = await getTyicketTypeById(order?.ticketTypeId as string);
  const evento = order?.event;
  let serviceCharge;
  if (evento) {
    const sC = await getServiceCharge(evento?.producerId);
    serviceCharge = sC || null;
  }
  const groupedEventDates = datesFormater(evento?.dates as string);
  const groupedTicketDates = datesFormater(ticketType?.dates as string);

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

  const serializedTicketType = ticketType
    ? {
        ...ticketType,
        price: Number(ticketType.price),
        discount:
          ticketType.discount !== null ? Number(ticketType.discount) : null,
      }
    : null;

  if (order?.status === "EXPIRED" || order?.status === "PAID") {
    return (
      <section className="w-full py-6 md:py-12 text-white">
        <h2 className="text-2xl mb-10 font-bold tracking-tighter sm:text-2xl md:text-3xl text-center">
          Orden vencida
        </h2>
      </section>
    );
  }

  return (
    <>
      <EventHeader
        evento={evento as GetSingleEventResponse}
        dates={groupedEventDates}
        width={10}
        height={10}
      />

      <section className="w-full py-6 md:py-6 mt-24 text-white px-4">
        <h2 className="mb-14 mt-10 scroll-m-20 text-4xl uppercase font-medium tracking-tight lg:text-6xl text-white text-stroke text-center">
          Datos de tu orden
        </h2>
        <OrderTotal
          order={serializedOrder as unknown as Order}
          groupedEventDates={groupedEventDates}
          groupedTicketDates={groupedTicketDates}
          ticketType={serializedTicketType as unknown as TicketType}
          serviceCharge={serviceCharge || undefined}
        />
      </section>

      <section className="w-full py-6 md:py-6 px-4">
        <h2 className="mb-14 scroll-m-20 text-4xl uppercase font-medium tracking-tight lg:text-6xl text-white text-stroke text-center">
          Tus datos
        </h2>
        <p className="mb-10 bg-gray-100 max-w-md p-10 border-4 border-black rounded-none mx-auto text-black shadow-hard">
          Una vez completados tus datos vas a poder realizar el pago. <br /> Vas
          a recibir tus entradas a tu casilla de email.
        </p>
        <OrderTimeOut order={serializedOrder as unknown as Order} />
        <div className="flex mx-auto align-center justify-center max-w-md bg-gray-100 border-4 border-black rounded-none p-5 mt-6 shadow-hard">
          <UserDataForm order={serializedOrder as unknown as Order} />
        </div>
      </section>
    </>
  );
}
