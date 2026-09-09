"use client";

import { useRouter } from "next/navigation";
import { SectorWithSeats } from "@/types/seat";
import { SeatMap } from "@/components/seat-map/seat-map";

interface SeatMapPageClientProps {
  sectors: SectorWithSeats[];
  eventSlug: string;
}

export function SeatMapPageClient({ sectors, eventSlug }: SeatMapPageClientProps) {
  const router = useRouter();

  function handleSeatConfirmed(seatCode: string, ticketTypeId: string) {
    // Redirect to event page with seat pre-selected in checkout
    router.push(
      `/eventos/${eventSlug}?seatCode=${encodeURIComponent(seatCode)}&ticketTypeId=${encodeURIComponent(ticketTypeId)}`
    );
  }

  if (sectors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Este evento no tiene asientos disponibles para elegir.</p>
      </div>
    );
  }

  return (
    <SeatMap
      sectors={sectors}
      eventSlug={eventSlug}
      onSeatConfirmed={handleSeatConfirmed}
    />
  );
}
