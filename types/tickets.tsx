import { Evento } from "./event";
import { Order } from "./order";
import { Promotion } from "./promotion";

type TicketTypeStatus = "ACTIVE" | "INACTIVE" | "ENDED" | "DELETED" | "SOLDOUT";

type TicketTypes =
  | "NORMAL"
  | "ABONO"
  | "PROMO"
  | "DESCUENTO"
  | "COMPRA_X_OBTEN_Y";

export interface TicketType {
  id?: string;
  title: string;
  description?: string | null;
  date?: Date | null;
  time?: string | null;
  price: number;
  eventId: string;
  createdById?: string | null;
  createdBy?: { id: string; name: string | null } | null;
  discount?: number | null;
  buyGet?: number | null;
  limitPerSale?: number | null;
  status: TicketTypeStatus;
  type: TicketTypes;
  startDate?: Date | null;
  endDate?: Date | null;
  quantity: number;
  position: number;
  dates?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  isFree?: boolean;
}

export interface TicketTypeWithStats extends TicketType {
  totalSold: number;
}

export type DatesType = {
  id: number;
  date: string;
};

export type TicketOrderType = {
  id?: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  base64Qr: string;
  date: Date;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  status: "NOT_VALIDATED" | "VALIDATED" | "CANCELED";
  isInvitation?: boolean;
  code?: number;
  validatedAt?: Date | null;
  validatedBy?: string | null;
  event?: Evento;
  ticketType?: Partial<TicketType>;
};

export type CanceledTicketOrder = {
  id: string;
  ticketOrderId: string;
  orderId: string;
  reason: string;
  details?: string | null;
  refunded: boolean;
  canceledAt: Date;
  canceledById: string;
};

export type TicketOrderTableProps = {
  id?: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  base64Qr: string;
  date: Date;
  orderId: string;
  eventId: string;
  ticketTypeId?: string;
  status: "NOT_VALIDATED" | "VALIDATED" | "CANCELED";
  ticketType?: Partial<TicketType> | undefined;
  createdAt?: Date | undefined;
  isInvitation?: boolean | undefined;
  validatedAt?: Date | null;
  validatedBy?: string | null;
  sessionValidatedAt?: Date | null;
  order?: Order | undefined;
  event?: Evento;
  code?: number;
};
