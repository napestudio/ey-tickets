"use client";

import { Order } from "@/types/order";
import { TicketType } from "@/types/tickets";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

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

  const subtotal = ticketType?.price! * order?.quantity!;
  const discountAmount = hasDiscount ? subtotal * (discountPercent! / 100) : 0;
  const afterDiscount = subtotal - discountAmount;
  const serviceChargeAmount = serviceCharge
    ? (afterDiscount * serviceCharge) / 100
    : 0;
  const total = afterDiscount + serviceChargeAmount;

  return (
    <div className="flex flex-col gap-3 text-white w-full">
      <div className="flex items-start justify-between pb-4 border-b border-white/10">
        <div>
          <p className="font-semibold">{ticketType?.title}</p>
          {groupedTicketDates && (
            <p className="text-sm text-white/50 mt-0.5">{groupedTicketDates}</p>
          )}
        </div>
        <span className="text-sm text-white/60 font-medium shrink-0 ml-4">
          × {order?.quantity}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-white/50">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {hasDiscount && discountPercent !== null && (
          <div className="flex justify-between text-sm text-ey-turquoise">
            <span>Descuento ({discountPercent}%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {serviceCharge > 0 && (
          <div className="flex justify-between text-sm text-white/50">
            <span>Costo de servicio ({serviceCharge}%)</span>
            <span>+{formatPrice(serviceChargeAmount)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold pt-3 border-t border-white/10">
          <span className="uppercase text-sm tracking-widest">Total</span>
          <span className="text-xl">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
