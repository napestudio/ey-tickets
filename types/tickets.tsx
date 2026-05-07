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
  date?: Date | null;
  time?: string | null;
  price: number;
  eventId: string;
  discount?: number | null;
  buyGet?: number | null;
  limit?: number | null;
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
  status: "NOT_VALIDATED" | "VALIDATED";
  isInvitation?: boolean;
  code?: number;
  event?: Evento;
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
  status: "NOT_VALIDATED" | "VALIDATED";
  ticketType?: Partial<TicketType> | undefined;
  createdAt?: Date | undefined;
  isInvitation?: boolean | undefined;
  order?: Order | undefined;
  event?: Evento;
  code?: number;
};
