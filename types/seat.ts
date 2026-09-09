export type SeatStatus = "AVAILABLE" | "HELD" | "SOLD" | "BLOCKED";

export interface Seat {
  id: string;
  eventVenueId: string;
  venueElementId: string;
  rowLabel: string;
  seatNumber: number;
  seatCode: string;
  tableCapacity: number | null;
  status: SeatStatus;
  heldUntil?: Date | null;
  ticketOrderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectorRowSeats {
  rowLabel: string;
  seats: Seat[];
}

export interface SectorWithSeats {
  venueElementId: string;
  label: string | null;
  color: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  ticketTypeId: string | null;
  ticketTypeTitle: string | null;
  ticketTypePrice: number | null;
  rows: SectorRowSeats[];
}

export interface SeatHoldResult {
  seatId: string;
  seatCode: string;
  ticketTypeId: string;
  tableCapacity: number | null;
  heldUntil: Date;
}
