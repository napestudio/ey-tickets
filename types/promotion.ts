export type Promotion = {
  id: string;
  title: string;
  description?: string | null;
  type: PromotionType;
  discount?: number | null;
  limit?: number | null;
  startDate: Date;
  endDate: Date;
  eventId?: string | null;
  ticketTypeId?: string | null;
  status: PromotionStatus;
  createdAt: Date;
  updatedAt: Date;
};

enum PromotionType {
  DESCUENTO = "DESCUENTO",
  COMPRA_X_OBTEN_Y = "COMPRA_X_OBTEN_Y",
}

enum PromotionStatus {
  ACTIVA = "ACTIVA",
  INACTIVA = "INACTIVA",
}
