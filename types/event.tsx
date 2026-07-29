import { EventPayment, TicketOrder, ValidatorToken } from "@prisma/client";
import { DiscountCode } from "./discount-code";
import { TicketOrderType, TicketType } from "./tickets";

export type EventStatus =
  | "DRAFT"
  | "ACTIVE"
  | "CANCELED"
  | "CONCLUDED"
  | "DELETED";

export type EventType = "PUBLIC" | "PRIVATE";

export type EventCategory =
  | "MUSIC"
  | "THEATER"
  | "CONFERENCE"
  | "SPORT"
  | "ART"
  | "GASTRONOMY"
  | "COMEDY"
  | "DANCE"
  | "FESTIVAL"
  | "CINEMA"
  | "CORPORATE"
  | "EXHIBITION"
  | "NIGHTLIFE"
  | "WORKSHOP"
  | "OTHER";

export interface Evento {
  id: string;
  title: string;
  slug?: string;
  description: string;
  address: string;
  state?: string | null;
  city?: string | null;
  producerId: string;
  createdById?: string | null;
  image: string;
  imagePublicId?: string | null;
  thumbnailImage?: string | null;
  thumbnailImagePublicId?: string | null;
  dates: string;
  status?: EventStatus;
  discountCode?: DiscountCode[] | undefined;
  ticketTypes?: TicketType[];
  validatorToken?: ValidatorToken[];
  eventPayments?: EventPayment[];
  startDate?: Date | null;
  saleEndDate?: Date | null;
  eventEndDate?: Date | null;
  createdAt?: Date;
  producer?: { id: string; name: string; slug: string } | null;
  category?: EventCategory | null;
  eventType?: EventType | null;
  legalText?: string | null;
  restrictions?: string[];
  venue?: string | null;
  ageRestriction?: number | null;
  website?: string | null;
}
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  MUSIC: "Música",
  THEATER: "Teatro",
  CONFERENCE: "Conferencia",
  SPORT: "Deporte",
  ART: "Arte",
  GASTRONOMY: "Gastronomía",
  COMEDY: "Comedia",
  DANCE: "Danza",
  FESTIVAL: "Festival",
  CINEMA: "Cine",
  CORPORATE: "Corporativo",
  EXHIBITION: "Exposición",
  NIGHTLIFE: "Vida nocturna",
  WORKSHOP: "Taller",
  OTHER: "Otro",
};

export interface EventoWithTicketsType {
  id: string;
  title: string;
  slug?: string;
  description: string;
  address: string;
  state?: string | null;
  city?: string | null;
  producerId: string;
  image: string;
  imagePublicId?: string | null;
  thumbnailImage?: string | null;
  thumbnailImagePublicId?: string | null;
  dates: string;
  status?: EventStatus;
  discountCode?: DiscountCode[] | undefined;
  ticketTypes?: TicketType[];
  validatorToken?: ValidatorToken[];
  eventPayments?: EventPayment[];
  tickets?: Partial<TicketOrderType>[] | undefined;
  producer?: { id: string; name: string; slug: string } | null;
  category?: EventCategory | null;
  eventType?: EventType | null;
  legalText?: string | null;
  restrictions?: string[];
  venue?: string | null;
  ageRestriction?: number | null;
  website?: string | null;
}
