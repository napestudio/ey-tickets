"use client";

import { Order } from "@/types/order";
import { TicketOrderType } from "@/types/tickets";
import { TicketType } from "@/types/tickets";
import { useEffect, useState } from "react";

type props = {
  order?: Partial<Order>;
  groupedEventDates: string;
  groupedTicketDates: string;
  ticketType?: Partial<TicketType> | undefined;
  serviceCharge?: number;
};

export default function OrderTotal({
  order,
  groupedEventDates,
  groupedTicketDates,
  ticketType,
  serviceCharge = 0,
}: props) {
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);

  useEffect(() => {
    const matchingCode = order?.event?.discountCode?.find(
      (discount) => discount.id === order.discountCode
    );
    if (matchingCode) {
      setHasDiscount(true);
      setDiscountPercent(matchingCode.discount);
    }
  }, [order]);

  const total = ticketType?.price! * order?.quantity!;

  const totalWithDiscount = hasDiscount
    ? total - total * (discountPercent! / 100)
    : total;

  const serviceChargePercent = serviceCharge / 100;
  const totalWithServiceCharge = totalWithDiscount * (1 + serviceChargePercent);
  return (
    <div className="flex mx-auto align-center justify-center gap-3 flex-col max-w-md text-black">
      <div className="flex gap-4 justify-between">
        <div className="item bg-gray-100 border-4 border-black rounded-none p-5 w-full">
          {ticketType?.title} | {groupedTicketDates}
        </div>
        <div className="item bg-gray-100 border-4 border-black rounded-none p-5 font-bold">
          {order?.quantity}
        </div>
      </div>
      <div className="item bg-gray-100 border-4 text-2xl border-black rounded-none p-5">
        <span>TOTAL:</span>
        <span className="font-bold">
          {" "}
          ${totalWithServiceCharge.toLocaleString("es-ar")}
        </span>
      </div>
    </div>
  );
}
