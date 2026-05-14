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
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};
