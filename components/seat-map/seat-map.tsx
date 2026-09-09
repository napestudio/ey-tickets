"use client";

import { useState } from "react";
import { SectorWithSeats } from "@/types/seat";
import { Seat } from "@/types/seat";
import { SeatMapSvg } from "./seat-map-svg";
import { SeatMapLegend } from "./seat-map-legend";
import { useSeatSelection } from "./use-seat-selection";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  sectors: SectorWithSeats[];
  eventSlug: string;
  onSeatConfirmed?: (seatCode: string, ticketTypeId: string) => void;
}

export function SeatMap({ sectors, eventSlug, onSeatConfirmed }: SeatMapProps) {
  const [zoom, setZoom] = useState(1);
  const { selectedSeat, isHolding, error, secondsLeft, selectSeat, releaseSelection } =
    useSeatSelection();

  function handleSelectSeat(seat: Seat) {
    selectSeat(seat.id);
  }

  function handleConfirm() {
    if (!selectedSeat) return;
    onSeatConfirmed?.(selectedSeat.seatCode, selectedSeat.ticketTypeId);
  }

  const totalAvailable = sectors
    .flatMap((s) => s.rows)
    .flatMap((r) => r.seats)
    .filter((s) => s.status === "AVAILABLE").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {totalAvailable} asiento{totalAvailable !== 1 ? "s" : ""} disponible
          {totalAvailable !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => setZoom(1)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* SVG map */}
      <SeatMapSvg
        sectors={sectors}
        selectedSeatId={selectedSeat?.seatId ?? null}
        zoom={zoom}
        onSelectSeat={handleSelectSeat}
      />

      {/* Legend */}
      <SeatMapLegend />

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Selection panel */}
      {selectedSeat && (
        <div className="border rounded-lg p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Asiento seleccionado</p>
              <p className="text-2xl font-bold">{selectedSeat.seatCode}</p>
            </div>
            {secondsLeft !== null && (
              <div
                className={cn(
                  "text-center",
                  secondsLeft <= 60 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <p className="text-xs">Reservado por</p>
                <p className="font-mono text-lg font-medium">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={releaseSelection}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={isHolding}
              className="flex-1"
            >
              Confirmar asiento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
