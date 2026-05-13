import { EventPayment, TicketOrder, ValidatorToken } from "@prisma/client";
import { DiscountCode } from "./discount-code";
import { TicketOrderType, TicketType } from "./tickets";

export type EventStatus =
  | "DRAFT"
  | "ACTIVE"
  | "CANCELED"
  | "CONCLUDED"
  | "DELETED";

export interface Evento {
  id: string;
  title: string;
  slug?: string;
  description: string;
  location: string;
  address: string;
  producerId: string;
  createdById?: string | null;
  image: string;
  dates: string;
  status?: EventStatus;
  discountCode?: DiscountCode[] | undefined;
  ticketTypes?: TicketType[];
  validatorToken?: ValidatorToken[];
  eventPayments?: EventPayment[];
  endDate?: Date;
  producer?: { id: string; name: string; slug: string } | null;
}
export interface EventoWithTicketsType {
  id: string;
  title: string;
  slug?: string;
  description: string;
  location: string;
  address: string;
  producerId: string;
  image: string;
  dates: string;
  status?: EventStatus;
  discountCode?: DiscountCode[] | undefined;
  ticketTypes?: TicketType[];
  validatorToken?: ValidatorToken[];
  eventPayments?: EventPayment[];
  tickets?: Partial<TicketOrderType>[] | undefined;
  producer?: { id: string; name: string; slug: string } | null;
}
