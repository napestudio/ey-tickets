export type TicketTypeBreakdown = {
  ticketTypeId: string;
  ticketTypeTitle: string;
  ticketTypeType: string;
  ticketsSold: number;
  revenue: number;
  avgPrice: number;
  sharePercent: number;
};

export type HourlySalesPoint = {
  hour: number;
  orderCount: number;
  ticketsSold: number;
  revenue: number;
};

export type DailySalesPoint = {
  date: string; // 'YYYY-MM-DD'
  orderCount: number;
  ticketsSold: number;
  revenue: number;
};

export type WeekdaySalesPoint = {
  weekday: number; // 0=Sunday, 6=Saturday
  label: string;   // "Dom", "Lun", etc.
  orderCount: number;
  ticketsSold: number;
};

export type ValidationHourlyPoint = {
  hour: number;
  validatedCount: number;
};

export type ValidatorTokenBreakdown = {
  tokenId: string;
  label: string;
  validatedCount: number;
};

export type PaymentMethodInfo = {
  paymentMethodId: string;
  name: string | null;
  type: string;
  commissionPercentage: number | null;
  // Actual tracked data (orders where paymentMethodId = this method)
  revenueTracked: number;
  ordersTracked: number;
  commissionActual: number;
  // Scenario: if 100% of total revenue went through this method
  commissionCostIfAll: number;
  netProfitIfAll: number;
  marginIfAll: number | null;
};

export type EventDetailedStats = {
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  eventDatesCount: number;
  // totalOrders = every completed Order for the event, sold or invited (the
  // system creates one Order per invitation too).
  totalOrders: number;
  // totalTicketsSold = purchase units (Order.quantity, PAID, non-invitation).
  // This is a *financial* unit, not a QR count: it's what TicketType.quantity
  // pool consumption and stock validation (adjustTicketTypeStock) are measured
  // in, so WAC/estimatedCost/profit/margin/averageTicketPrice below are all
  // computed against this. For a multi-date event this is smaller than
  // ticketOrdersIssued (a single purchased unit yields one QR per event date).
  // Do NOT use this for a "tickets vendidos" headline — use ticketOrdersIssued.
  totalTicketsSold: number;
  averageTicketPrice: number;
  // Attendance / physical QR counts — one TicketOrder per event date per unit
  // sold or invited, so these are the real "cuántos QR existen" numbers.
  // ticketOrdersIssued = "Tickets vendidos": every QR that was PAID for
  // (excludes invitations — see invitationTickets).
  ticketOrdersIssued: number;
  // validatedTickets = "Entradas validadas": every QR scanned by a validator
  // at the door, sold or invited (attendanceRate is measured against
  // totalTicketsIssued, the full physical count, to match).
  validatedTickets: number;
  attendanceRate: number | null;
  // invitationTickets = "Invitaciones": physical QRs issued from
  // add-invitation-dialog (not a sum of Order.quantity). Excluded from
  // totalTicketsSold/totalRevenue since invitations carry no price.
  invitationTickets: number;
  // totalTicketsIssued = "Entradas emitidas": 100% of physical QRs that exist
  // for the event — ticketOrdersIssued + invitationTickets.
  totalTicketsIssued: number;
  // Discounts
  discountedOrders: number;
  // Financials
  totalRevenue: number;
  estimatedCost: number;
  profit: number;
  margin: number | null;
  wac: number;
  totalDiscountsGiven: number;
  totalServiceCharges: number;
  netTicketRevenue: number;
  ticketProfit: number;
  // Breakdowns
  ticketTypeBreakdown: TicketTypeBreakdown[];
  hourlySales: HourlySalesPoint[];
  dailySales: DailySalesPoint[];
  weekdaySales: WeekdaySalesPoint[];
  // When people were actually scanned in (validatedAt), vs hourlySales which
  // is about purchase time (createdAt).
  validationHourly: ValidationHourlyPoint[];
  // Attendance grouped by ValidatorToken (door/device). Includes a
  // "Sin validador asignado" bucket for validations with no session on
  // record (legacy data or a validator that predates this feature).
  validationByToken: ValidatorTokenBreakdown[];
  paymentMethods: PaymentMethodInfo[];
  // Orders where paymentMethodId is null (pre-tracking or unknown method)
  revenueUntracked: number;
  ordersUntracked: number;
  dateRange: { earliest: string | null; latest: string | null };
};
