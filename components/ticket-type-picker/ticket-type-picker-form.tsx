"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { formatPrice } from "@/lib/utils";
import { createSecureOrder } from "@/lib/actions";
import { TicketType } from "@/types/tickets";
import { Minus, Plus, Tag, X, CheckCircle2 } from "lucide-react";

export type TicketTypeForPicker = Pick<
  TicketType,
  | "id"
  | "title"
  | "price"
  | "discount"
  | "limitPerSale"
  | "buyGet"
  | "status"
  | "endDate"
  | "dates"
  | "quantity"
  | "isFree"
>;

type PickerFormProps = {
  tickets: TicketTypeForPicker[];
  eventId: string;
  serviceCharge: number;
  hasDiscountCodes: boolean;
  soldTickets?: Record<string, { count: number }>;
  saleEndDate?: Date | null;
  onClose?: () => void;
};

// Client-side check relies only on explicit status — the server validates
// endDate, stock and pricing on submit. Avoids false positives from stale data.
function getTicketDisplayStatus(
  ticket: TicketTypeForPicker,
  soldTickets?: Record<string, { count: number }>,
  saleEndDate?: Date | null
): "available" | "soldout" | "ended" {
  if (ticket.status === "SOLDOUT") return "soldout";
  if (ticket.status === "ENDED") return "ended";
  if (ticket.endDate && new Date(ticket.endDate) < new Date()) return "ended";
  // When no custom endDate is set, fall back to the event's saleEndDate
  if (!ticket.endDate && saleEndDate && new Date(saleEndDate) < new Date()) return "ended";
  // Cross-check sold count only when soldTickets data is available
  // Use || 1 (not ?? 1) so that buyGet=0 is also treated as 1
  if (soldTickets && ticket.id) {
    const bGet = ticket.buyGet || 1;
    const sold = soldTickets[ticket.id]?.count ?? 0;
    if (sold > 0 && ticket.quantity <= sold / bGet) return "soldout";
  }
  return "available";
}

export default function TicketTypePickerForm({
  tickets,
  eventId,
  serviceCharge,
  hasDiscountCodes,
  soldTickets,
  saleEndDate,
  onClose,
}: PickerFormProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Show all non-deleted/non-inactive tickets — unavailable ones are displayed as disabled
  const visibleTickets = tickets.filter(
    (t) => t.status !== "DELETED" && t.status !== "INACTIVE"
  );

  const selectedTicket = visibleTickets.find((t) => t.id === selectedId);
  const selectedStatus = selectedTicket
    ? getTicketDisplayStatus(selectedTicket, soldTickets, saleEndDate)
    : "available";
  const selectedUnavailable = selectedStatus !== "available";

  const effectiveMaxQty = appliedCode ? 1 : (selectedTicket?.limitPerSale ?? 10);

  const handleSelect = (ticket: TicketTypeForPicker) => {
    if (getTicketDisplayStatus(ticket, soldTickets, saleEndDate) !== "available") return;
    setSelectedId(ticket.id!);
    setQuantity(1);
    setAppliedCode(undefined);
    setDiscountCode("");
    setShowCodeInput(false);
  };

  const handleIncrement = () => {
    if (quantity < effectiveMaxQty) setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const applyCode = () => {
    const trimmed = discountCode.trim();
    if (!trimmed) return;
    setAppliedCode(trimmed);
    setQuantity(1);
    setShowCodeInput(false);
  };

  const removeCode = () => {
    setAppliedCode(undefined);
    setDiscountCode("");
  };

  // Display-only calculation — server always recalculates on submit
  const unitPrice = selectedTicket?.price ?? 0;
  const displaySubtotal = unitPrice * quantity;
  const displayServiceCharge = serviceCharge
    ? (displaySubtotal * serviceCharge) / 100
    : 0;
  const displayTotal = displaySubtotal + displayServiceCharge;

  const canSubmit = !!selectedTicket && !selectedUnavailable && quantity > 0;

  async function handleSubmit() {
    if (!canSubmit || !selectedTicket?.id) return;
    setIsLoading(true);
    try {
      await createSecureOrder({
        ticketTypeId: selectedTicket.id,
        quantity,
        eventId,
        discountCode: appliedCode,
      });
      onClose?.();
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error as Error & { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Ocurrió un error.",
        description:
          error instanceof Error ? error.message : "Intentá de nuevo.",
      });
    }
  }

  if (visibleTickets.length === 0) {
    return (
      <p className="text-white/50 text-sm text-center py-6">
        No hay entradas disponibles.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Ticket type cards */}
      <div className="flex flex-col gap-2">
        {visibleTickets.map((ticket) => {
          const ticketStatus = getTicketDisplayStatus(ticket, soldTickets, saleEndDate);
          const unavailable = ticketStatus !== "available";
          const isSelected = ticket.id === selectedId;
          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() => handleSelect(ticket)}
              disabled={unavailable || isLoading}
              className={[
                "w-full text-left p-4 transition-all border-2",
                isSelected
                  ? "bg-ey-turquoise border-ey-turquoise text-ey-dark"
                  : unavailable
                    ? "bg-transparent border-white/10 text-white/30 cursor-not-allowed"
                    : "bg-transparent border-white/20 text-white hover:border-ey-turquoise cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-sm leading-tight">
                  {ticket.title}
                  {unavailable && (
                    <span className="ml-2 text-xs font-normal opacity-60">
                      {ticketStatus === "soldout" ? "· Agotado" : "· Venta finalizada"}
                    </span>
                  )}
                </span>
                <span className="font-bold text-sm shrink-0">
                  {ticket.isFree ? "GRATIS" : formatPrice(ticket.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quantity selector */}
      {selectedTicket && !selectedUnavailable && (
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm uppercase tracking-widest">
            Cantidad
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1 || isLoading}
              className="border border-ey-turquoise text-ey-turquoise w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-ey-turquoise hover:text-ey-dark transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold text-xl text-white w-5 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= effectiveMaxQty || isLoading}
              className="border border-ey-turquoise text-ey-turquoise w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-ey-turquoise hover:text-ey-dark transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Discount code */}
      {selectedTicket && !selectedUnavailable && hasDiscountCodes && (
        <>
          {appliedCode ? (
            <div className="flex items-center justify-between border border-ey-turquoise/40 bg-ey-turquoise/10 px-3 py-2">
              <div className="flex items-center gap-2 text-ey-turquoise text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Código aplicado: {appliedCode}</span>
              </div>
              <button
                type="button"
                onClick={removeCode}
                disabled={isLoading}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : showCodeInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-transparent border border-white/20 text-white placeholder:text-white/30 px-3 py-2 text-sm focus:border-ey-turquoise focus:outline-none transition-colors"
                placeholder="Código de descuento"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && applyCode()}
              />
              <button
                type="button"
                onClick={applyCode}
                disabled={isLoading || !discountCode.trim()}
                className="bg-ey-turquoise text-ey-dark px-4 py-2 text-sm font-bold uppercase rounded-xl hover:bg-ey-turquoise-dark transition-colors disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              disabled={isLoading}
              className="flex items-center gap-2 text-ey-turquoise text-sm hover:underline"
            >
              <Tag className="w-3 h-3" />
              Tengo un código de descuento
            </button>
          )}
        </>
      )}

      {/* Price breakdown */}
      {selectedTicket && !selectedUnavailable && (
        <div className="border-t border-white/10 pt-4 space-y-1">
          {serviceCharge > 0 && (
            <>
              <div className="flex justify-between text-sm text-white/50">
                <span>Subtotal</span>
                <span>{formatPrice(displaySubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/50">
                <span>Costo de servicio ({serviceCharge}%)</span>
                <span>+{formatPrice(displayServiceCharge)}</span>
              </div>
            </>
          )}
          {appliedCode && (
            <div className="flex justify-between text-sm text-ey-turquoise">
              <span>Descuento</span>
              <span>Se aplica al confirmar</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-white pt-1">
            <span className="uppercase text-sm tracking-widest">Total</span>
            <span className="text-xl">{formatPrice(displayTotal)}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || isLoading}
        className="w-full bg-ey-turquoise text-ey-dark rounded-2xl uppercase font-bold text-base py-4 hover:bg-ey-turquoise-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? "Procesando..." : "Comprar"}
      </button>
    </div>
  );
}
