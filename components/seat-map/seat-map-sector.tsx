"use client";

import { SectorWithSeats } from "@/types/seat";
import { Seat } from "@/types/seat";
import { SeatMapSeat, SEAT_SIZE, SEAT_RADIUS } from "./seat-map-seat";

const CELL_SIZE = 40;
const GAP = 2;
const ROW_HEIGHT = SEAT_SIZE + GAP + 4;
const LABEL_WIDTH = 20;
const SEAT_STEP = SEAT_SIZE + GAP;
const HEADER_HEIGHT = 20;

interface SeatMapSectorProps {
  sector: SectorWithSeats;
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
}

export function SeatMapSector({ sector, selectedSeatId, onSelectSeat }: SeatMapSectorProps) {
  const sectorX = sector.x * CELL_SIZE;
  const sectorY = sector.y * CELL_SIZE;
  const sectorW = sector.width * CELL_SIZE;
  const sectorH = sector.height * CELL_SIZE;

  return (
    <g transform={`translate(${sectorX}, ${sectorY})`}>
      {/* Sector background */}
      <rect
        x={0}
        y={0}
        width={sectorW}
        height={sectorH}
        rx={4}
        fill={(sector.color ?? "#3b82f6") + "22"}
        stroke={(sector.color ?? "#3b82f6") + "66"}
        strokeWidth={1}
      />

      {/* Sector label */}
      <text
        x={sectorW / 2}
        y={14}
        textAnchor="middle"
        fill="#e4e4e7"
        fontSize={11}
        fontWeight="600"
        fontFamily="sans-serif"
      >
        {sector.label ?? "Sector"}
      </text>

      {/* Rows */}
      {sector.rows.map((row, rowIdx) => {
        const rowY = HEADER_HEIGHT + rowIdx * ROW_HEIGHT + SEAT_RADIUS;
        return (
          <g key={row.rowLabel}>
            {/* Row label */}
            <text
              x={LABEL_WIDTH / 2}
              y={rowY + SEAT_RADIUS / 2}
              textAnchor="middle"
              fill="#a1a1aa"
              fontSize={8}
              fontFamily="sans-serif"
            >
              {row.rowLabel}
            </text>

            {/* Seats */}
            {row.seats.map((seat, seatIdx) => {
              const cx = LABEL_WIDTH + seatIdx * SEAT_STEP + SEAT_RADIUS;
              return (
                <SeatMapSeat
                  key={seat.id}
                  seat={seat}
                  cx={cx}
                  cy={rowY}
                  isSelected={selectedSeatId === seat.id}
                  onSelect={onSelectSeat}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
