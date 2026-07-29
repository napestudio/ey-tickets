"use client";

import { useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import TicketTypePickerForm, {
  TicketTypeForPicker,
} from "./ticket-type-picker-form";

type TicketTypePickerV2Props = {
  tickets: TicketTypeForPicker[];
  eventId: string;
  serviceCharge: number;
  hasDiscountCodes: boolean;
  soldTickets?: Record<string, { count: number }>;
};

// Returns the lowest price among tickets that appear purchasable.
// Uses only status and endDate — same logic as getTicketDisplayStatus in the form.
function getMinAvailablePrice(
  tickets: TicketTypeForPicker[],
  soldTickets?: Record<string, { count: number }>
): number | null {
  const available = tickets.filter((t) => {
    if (
      t.status === "DELETED" ||
      t.status === "INACTIVE" ||
      t.status === "SOLDOUT" ||
      t.status === "ENDED"
    )
      return false;
    if (t.endDate && new Date(t.endDate) < new Date()) return false;
    if (soldTickets && t.id) {
      const bGet = t.buyGet || 1; // || 1 so buyGet=0 is treated as 1 (no promotion)
      const sold = soldTickets[t.id]?.count ?? 0;
      if (sold > 0 && t.quantity <= sold / bGet) return false;
    }
    return true;
  });
  if (available.length === 0) return null;
  return Math.min(...available.map((t) => t.price));
}

export default function TicketTypePickerV2({
  tickets,
  eventId,
  serviceCharge,
  hasDiscountCodes,
  soldTickets,
}: TicketTypePickerV2Props) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleTickets = tickets.filter(
    (t) => t.status !== "DELETED" && t.status !== "INACTIVE"
  );

  const minPrice = getMinAvailablePrice(tickets, soldTickets);
  const hasAnyTicket = visibleTickets.length > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating bottom container */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Expanded sheet */}
        {isOpen && (
          <div className="bg-ey-dark border-t-2 border-ey-turquoise max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/10 sticky top-0 bg-ey-dark">
              <span className="text-ey-turquoise font-bold uppercase tracking-widest text-xs">
                Seleccioná tu entrada
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto w-full">
              <TicketTypePickerForm
                tickets={tickets}
                eventId={eventId}
                serviceCharge={serviceCharge}
                hasDiscountCodes={hasDiscountCodes}
                soldTickets={soldTickets}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Collapsed bar — always visible */}
        <div className="bg-ey-dark border-t-2 border-ey-turquoise px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div>
            {minPrice !== null ? (
              <>
                <p className="text-white/50 text-xs uppercase tracking-widest leading-none mb-0.5">
                  Entradas desde
                </p>
                <p className="text-white font-bold text-lg leading-none">
                  {minPrice > 0 ? formatPrice(minPrice) : "GRATIS"}
                </p>
              </>
            ) : hasAnyTicket ? (
              <p className="text-white/50 text-sm">Ver disponibilidad</p>
            ) : (
              <p className="text-white/40 text-sm">Sin entradas</p>
            )}
          </div>

          {hasAnyTicket && (
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center gap-2 bg-ey-turquoise text-ey-dark rounded-2xl uppercase font-bold text-sm px-6 py-3 hover:bg-ey-turquoise-dark transition-colors shrink-0"
            >
              {isOpen ? "Cerrar" : "Ver entradas"}
              <ChevronUp
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
