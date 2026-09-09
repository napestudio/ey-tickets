"use client";

import { Seat } from "@/types/seat";
import { cn } from "@/lib/utils";

const SEAT_RADIUS = 7;
const SEAT_SIZE = SEAT_RADIUS * 2;

interface SeatMapSeatProps {
  seat: Seat;
  cx: number;
  cy: number;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "#22c55e",
  HELD: "#f59e0b",
  SOLD: "#6b7280",
  BLOCKED: "#374151",
};

export function SeatMapSeat({ seat, cx, cy, isSelected, onSelect }: SeatMapSeatProps) {
  const isClickable = seat.status === "AVAILABLE";
  const color = isSelected ? "#3b82f6" : STATUS_COLORS[seat.status] ?? "#6b7280";

  return (
    <g
      className={cn(isClickable && "cursor-pointer")}
      onClick={() => isClickable && onSelect(seat)}
    >
      <circle
        cx={cx}
        cy={cy}
        r={SEAT_RADIUS}
        fill={color}
        stroke={isSelected ? "#fff" : "transparent"}
        strokeWidth={isSelected ? 1.5 : 0}
        opacity={seat.status === "BLOCKED" ? 0.3 : 1}
      />
      {isSelected && (
        <circle cx={cx} cy={cy} r={SEAT_RADIUS + 3} fill="none" stroke="#3b82f6" strokeWidth={1} opacity={0.5} />
      )}
    </g>
  );
}

export { SEAT_SIZE, SEAT_RADIUS };
