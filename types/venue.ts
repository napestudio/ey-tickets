export type VenueElementType =
  | "ROW"
  | "STAGE"
  | "TABLE"
  | "TEXT"
  | "ENTRANCE"
  | "EXIT";

export type SeatPattern = "ALL" | "ODD" | "EVEN";
export type SeatOrder = "ASC" | "DESC";
export type VenueStatus = "ACTIVE" | "ARCHIVED";

// ─── Logical sector (name + color only, no canvas position) ───────────────────

export interface VenueSector {
  id?: string;
  venueId?: string;
  name: string;
  color: string;
  position: number;
}

// ─── Canvas element ───────────────────────────────────────────────────────────

export interface VenueElement {
  id?: string;
  venueId?: string;
  type: VenueElementType;
  label?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string | null;
  rotation?: number | null;
  sectorId?: string | null;
  // ROW-specific fields (null/undefined for other types)
  rowLabel?: string | null;
  startNumber?: number | null;
  seatCount?: number | null;
  seatPattern?: SeatPattern | null;
  orderDirection?: SeatOrder | null;
  seatSpacing?: number | null;
  // TABLE-specific fields
  tableCapacity?: number | null;
}

// ─── Venue ────────────────────────────────────────────────────────────────────

export interface Venue {
  id: string;
  name: string;
  producerId: string;
  description?: string | null;
  widthCells: number;
  heightCells: number;
  status: VenueStatus;
  sectors?: VenueSector[];
  elements?: VenueElement[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Event-venue ──────────────────────────────────────────────────────────────

export interface EventVenue {
  id: string;
  eventId: string;
  venueId: string;
  venue?: Venue;
  mappings?: EventSectorMapping[];
}

export interface EventSectorMapping {
  id?: string;
  eventVenueId: string;
  venueSectorId: string;
  ticketTypeId: string;
  venueSector?: Pick<VenueSector, "id" | "name" | "color">;
  ticketType?: { id: string; title: string; price: number | string };
}

// ─── Editor-specific types ────────────────────────────────────────────────────

export interface EditorSector extends VenueSector {
  localId: string;
}

export interface EditorElement extends VenueElement {
  localId: string;
  isDirty: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ELEMENT_DEFAULTS: Record<
  VenueElementType,
  { width: number; height: number; label: string }
> = {
  ROW: { width: 8, height: 1, label: "Fila" },
  STAGE: { width: 8, height: 3, label: "Escenario" },
  TABLE: { width: 2, height: 2, label: "Mesa" },
  TEXT: { width: 4, height: 1, label: "Texto" },
  ENTRANCE: { width: 2, height: 2, label: "Entrada" },
  EXIT: { width: 2, height: 2, label: "Salida" },
};

export const ELEMENT_COLORS: Record<VenueElementType, string> = {
  ROW: "#6b7280",
  STAGE: "#8b5cf6",
  TABLE: "#f59e0b",
  TEXT: "#6b7280",
  ENTRANCE: "#10b981",
  EXIT: "#ef4444",
};

export const SECTOR_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];
