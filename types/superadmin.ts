export type ProducerStatus = "ACTIVE" | "SUSPENDED" | "IN_DEBT" | "DELETED";

export interface UpdateProducerStatusInput {
  status: ProducerStatus;
}

export interface CreateProducerInput {
  producer: {
    name: string;
    email: string;
    phone?: string;
    venueType?: string;
    eventCategories?: string[];
  };
  owner: {
    name: string;
    email: string;
    password: string;
  };
}

export interface CreateProducerResult {
  producer: {
    id: string;
    name: string;
    slug: string;
    email: string;
  };
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface ProducerSummary {
  id: string;
  name: string;
  logo: string | null;
  createdAt: Date;
  createdFrom: string;
  status: ProducerStatus;
  eventCount: number;
  totalPool: number;
  availableTickets: number;
}

export interface SuperadminProducersResponse {
  producers: ProducerSummary[];
}

export interface ProducerMemberDetail {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface ProducerEventSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  startDate: Date | null;
  saleEndDate: Date | null;
  eventEndDate: Date | null;
  createdAt: Date;
}

export interface TicketPackageDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  purchasedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface TicketTypeSummary {
  id: string;
  title: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  soldCount: number;
  status: string;
}

export interface ProducerStockSummary {
  totalPool: number;
  usedByTicketTypes: number;
  allocatedToMembers: number;
  available: number;
  soldTickets: number;
}

export interface ProducerDetail {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  logo: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdFrom: string;
  status: ProducerStatus;
  members: ProducerMemberDetail[];
  events: ProducerEventSummary[];
  ticketPackages: TicketPackageDetail[];
  ticketTypes: TicketTypeSummary[];
  stockSummary: ProducerStockSummary;
}

export interface CreateTicketPackageInput {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expiresAt?: string;
  notes?: string;
}

export interface TicketPackageSummary {
  id: string;
  producerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  purchasedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface AdjustProducerStockInput {
  action: "add" | "remove" | "set";
  quantity: number;
  reason?: string;
}

export interface AdjustProducerStockResult {
  previousPool: number;
  newPool: number;
  delta: number;
  packageId: string;
}

// ─────────────────────────────────────────────
// FEATURED EVENTS (CAROUSEL)
// ─────────────────────────────────────────────

export type FeaturedEventStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface CreateFeaturedEventInput {
  eventId: string;
  position: number;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  price: number;
  notes?: string;
}

export interface UpdateFeaturedEventInput {
  position?: number;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  status?: FeaturedEventStatus;
  price?: number;
  notes?: string;
}

export interface FeaturedEventDetail {
  id: string;
  position: number;
  startDate: Date;
  endDate: Date;
  status: FeaturedEventStatus;
  price: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    featuredImage: string | null;
    startDate: Date | null;
    eventEndDate: Date | null;
    producer: {
      id: string;
      name: string;
    };
  };
}

export interface FeaturedEventCarouselItem {
  id: string;
  position: number;
  event: {
    id: string;
    title: string;
    slug: string;
    image: string | null;
    featuredImage: string | null;
    startDate: Date | null;
    eventEndDate: Date | null;
  };
}
