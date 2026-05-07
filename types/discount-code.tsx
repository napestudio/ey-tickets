import { Evento } from "./event";

export type GlobalStatus =
  | "DRAFT"
  | "ACTIVE"
  | "CANCELED"
  | "CONCLUDED"
  | "DELETED";

export interface DiscountCode {
  id?: string;
  eventId?: string;
  ticketTypeId?: string;
  code: string;
  expiresAt: Date;
  status: GlobalStatus;
  discount: number;
  event?: any;
}
