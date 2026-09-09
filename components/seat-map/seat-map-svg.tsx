"use client";

import { SectorWithSeats } from "@/types/seat";
import { Seat } from "@/types/seat";
import { SeatMapSector } from "./seat-map-sector";

const CELL_SIZE = 40;

interface SeatMapSvgProps {
  sectors: SectorWithSeats[];
  selectedSeatId: string | null;
  zoom: number;
  onSelectSeat: (seat: Seat) => void;
}

export function SeatMapSvg({ sectors, selectedSeatId, zoom, onSelectSeat }: SeatMapSvgProps) {
  if (sectors.length === 0) return null;

  const maxX = Math.max(...sectors.map((s) => s.x + s.width));
  const maxY = Math.max(...sectors.map((s) => s.y + s.height));

  const viewWidth = maxX * CELL_SIZE + 40;
  const viewHeight = maxY * CELL_SIZE + 40;

  return (
    <div className="overflow-auto flex justify-center">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        style={{
          width: viewWidth * zoom,
          height: viewHeight * zoom,
          transition: "width 0.15s, height 0.15s",
          display: "block",
        }}
        className="rounded-lg bg-zinc-900"
      >
        {sectors.map((sector) => (
          <SeatMapSector
            key={sector.venueElementId}
            sector={sector}
            selectedSeatId={selectedSeatId}
            onSelectSeat={onSelectSeat}
          />
        ))}
      </svg>
    </div>
  );
}
