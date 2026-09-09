"use client";

import { useState, useEffect, useCallback } from "react";
import { holdSeatAction, releaseSeatAction } from "@/lib/actions";
import { SeatHoldResult } from "@/types/seat";

interface SeatSelectionState {
  selectedSeat: SeatHoldResult | null;
  isHolding: boolean;
  error: string | null;
  secondsLeft: number | null;
  selectSeat: (seatId: string) => Promise<void>;
  releaseSelection: () => Promise<void>;
}

export function useSeatSelection(): SeatSelectionState {
  const [selectedSeat, setSelectedSeat] = useState<SeatHoldResult | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!selectedSeat) {
      setSecondsLeft(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(selectedSeat.heldUntil).getTime() - Date.now()) / 1000
        )
      );
      setSecondsLeft(remaining);

      if (remaining === 0) {
        setSelectedSeat(null);
        setError("La reserva del asiento expiró. Seleccioná otro.");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [selectedSeat]);

  const selectSeat = useCallback(async (seatId: string) => {
    setIsHolding(true);
    setError(null);

    // Release previous selection if any
    if (selectedSeat) {
      try {
        await releaseSeatAction(selectedSeat.seatId);
      } catch {
        // ignore
      }
    }

    try {
      const seat = await holdSeatAction(seatId);
      setSelectedSeat({
        seatId: seat.id,
        seatCode: seat.seatCode,
        ticketTypeId: seat.ticketTypeId ?? "",
        tableCapacity: seat.tableCapacity ?? null,
        heldUntil: new Date(seat.heldUntil!),
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo reservar el asiento."
      );
      setSelectedSeat(null);
    } finally {
      setIsHolding(false);
    }
  }, [selectedSeat]);

  const releaseSelection = useCallback(async () => {
    if (!selectedSeat) return;
    try {
      await releaseSeatAction(selectedSeat.seatId);
    } catch {
      // ignore
    }
    setSelectedSeat(null);
    setError(null);
  }, [selectedSeat]);

  return {
    selectedSeat,
    isHolding,
    error,
    secondsLeft,
    selectSeat,
    releaseSelection,
  };
}
