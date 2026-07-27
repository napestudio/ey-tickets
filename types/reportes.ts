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
  // Sales totals
  totalOrders: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  // Attendance
  validatedTickets: number;
  attendanceRate: number | null;
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
  paymentMethods: PaymentMethodInfo[];
  // Orders where paymentMethodId is null (pre-tracking or unknown method)
  revenueUntracked: number;
  ordersUntracked: number;
  dateRange: { earliest: string | null; latest: string | null };
};
