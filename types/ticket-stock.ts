export type TicketPackageStatus = "ACTIVE" | "EXPIRED" | "CANCELED";

export type TicketPackagePaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type TicketPackage = {
  id: string;
  producerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: TicketPackageStatus;
  paymentStatus: TicketPackagePaymentStatus;
  purchasedAt: Date;
  expiresAt: Date | null;
  notes: string | null;
  mpPaymentId: string | null;
  mpDateApproved: Date | null;
  mpPaymentMethodId: string | null;
  mpPaymentTypeId: string | null;
  mpInstallments: number | null;
  mpAuthorizationCode: string | null;
  mpTransactionAmount: number | null;
  mpNetReceivedAmount: number | null;
  mpFeeAmount: number | null;
  mpCurrencyId: string | null;
  mpRawResponse: object | null;
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
  usedByTicketTypes: number;
  allocatedToMembers: number;
  available: number;
  soldTickets: number;
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

export type StockMovementType = "INCREASE" | "DECREASE";

export type TicketStockMovement = {
  id: string;
  ticketTypeId: string;
  eventId: string;
  producerId: string;
  performedById: string;
  type: StockMovementType;
  delta: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string | null;
  createdAt: Date;
  performedBy?: { id: string; name: string | null };
};
