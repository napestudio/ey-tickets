import { Evento, EventPaymentWithMethod } from "./event";
import { TicketType } from "./tickets";

type EventoForOrder = Omit<Evento, "eventPayments"> & {
  eventPayments?: EventPaymentWithMethod[];
};

export interface Order {
  id?: string;
  fullName?: string;
  dni?: string;
  email?: string;
  phone?: string;
  status: string;
  ticketTypeId: string;
  eventId: string;
  createdAt: Date;
  event?: EventoForOrder;
  ticketType?: TicketType;
  quantity?: number;
  discountCode?: string;
  customizationToken?: string | null;
  customizedAt?: Date | null;
  seatId?: string | null;
  paymentMethodId?: string | null;
  confirmedAt?: Date | null;
  totalPrice?: number | null;
}
