export type TicketPackageStatus = "ACTIVE" | "EXPIRED" | "CANCELED";

export type TicketPackage = {
  id: string;
  producerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: TicketPackageStatus;
  purchasedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventTicketAllocation = {
  id: string;
  producerId: string;
  eventId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberTicketAllocation = {
  id: string;
  producerId: string;
  userId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export type StockSummary = {
  totalPool: number;
  allocatedToEvents: number;
  allocatedToMembers: number;
  unallocated: number;
};

export type PackageCatalogItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPrice?: number | null;
};

export type EventProfitRow = {
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  ticketsSold: number;
  revenue: number;
  estimatedCost: number;
  profit: number;
  margin: number | null;
};

export type ProfitReport = {
  wac: number;
  totalPackageCost: number;
  totalPool: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalEstimatedCost: number;
  inventoryValue: number;
  totalProfit: number;
  totalMargin: number | null;
  events: EventProfitRow[];
};

export type EventStatus =
  | "DRAFT"
  | "ACTIVE"
  | "CONCLUDED"
  | "CANCELED"
  | "DELETED";

export type AllocationWithUsage = {
  id: string;
  producerId: string;
  eventId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    status: EventStatus;
    endDate: Date | null;
  };
  ticketTypesQuantity: number;
  ticketsSold: number;
};
