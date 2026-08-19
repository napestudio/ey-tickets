"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuickSaleOrder } from "@/lib/actions";
import { generateTicketsPdf } from "@/lib/pdf-utils";
import { isBefore } from "date-fns";
import { CheckCircle, Download, RefreshCw, Zap } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type TicketTypeItem = {
  id: string;
  title: string;
  price: number;
  status: string;
  quantity: number;
  limitPerSale?: number | null;
  endDate: Date | string | null;
  buyGet?: number | null;
};

type SoldTickets = Record<string, { count: number }>;

type SaleResult = {
  ticketIds: string[];
  generatedAt: string;
};

function isPastEndDate(endDate: Date | string): boolean {
  return isBefore(new Date(endDate), new Date());
}

function computeMaxQty(
  ticket: TicketTypeItem,
  soldTickets?: SoldTickets,
): number {
  const soldCount = soldTickets?.[ticket.id]?.count ?? 0;
  const bGet = ticket.buyGet || 1;
  const available = Math.max(0, Math.floor(ticket.quantity - soldCount / bGet));
  const limit =
    ticket.limitPerSale && ticket.limitPerSale > 0
      ? ticket.limitPerSale
      : available;
  return Math.min(available, limit);
}

export default function QuickSaleForm({
  tickets,
  eventId,
  eventTitle,
  soldTickets,
  cashPaymentMethodId,
}: {
  tickets: TicketTypeItem[];
  eventId: string;
  eventTitle: string;
  soldTickets?: SoldTickets;
  cashPaymentMethodId?: string;
}) {
  const firstAvailable = tickets.find(
    (t) =>
      t.status !== "SOLDOUT" &&
      (t.endDate == null || !isPastEndDate(t.endDate)) &&
      (soldTickets?.[t.id]?.count ?? 0) / (t.buyGet || 1) < t.quantity,
  );
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>(
    firstAvailable?.id ?? "",
  );
  const [selectedTicketTitle, setSelectedTicketTitle] = useState<string>(
    firstAvailable?.title ?? "",
  );
  const [quantity, setQuantity] = useState<string>("1");
  const [maxQty, setMaxQty] = useState<number>(() =>
    firstAvailable ? computeMaxQty(firstAvailable, soldTickets) : 1,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedTicketTypeId) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await createQuickSaleOrder({
        ticketTypeId: selectedTicketTypeId,
        quantity: parseInt(quantity),
        eventId,
        paymentMethodId: cashPaymentMethodId,
      });
      setSaleResult(result);
    } catch {
      setError("Ocurrió un error al generar la venta. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSaleResult(null);
    setSelectedTicketTypeId("");
    setSelectedTicketTitle("");
    setQuantity("1");
    setError(null);
  }

  async function handleDownloadPdf() {
    if (!saleResult) return;
    const generatedDate = new Date(saleResult.generatedAt);
    const formattedDate = format(generatedDate, "dd/MM/yyyy HH:mm", {
      locale: es,
    });
    await generateTicketsPdf({
      ticketIds: saleResult.ticketIds,
      eventTitle,
      ticketTypeTitle: selectedTicketTitle,
      generatedAt: saleResult.generatedAt,
      filename: `venta-rapida-${formattedDate.replace(/[/:]/g, "-")}.pdf`,
    });
  }

  if (saleResult) {
    const generatedDate = new Date(saleResult.generatedAt);
    const formattedDate = format(generatedDate, "dd 'de' MMMM yyyy, HH:mm:ss", {
      locale: es,
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-ey-dark">
          <CheckCircle className="h-6 w-6 text-neutral-50 shrink-0" />
          <div>
            <p className="font-semibold text-neutral-50">Venta exitosa</p>
            <p className="text-sm text-neutral-50">
              {saleResult.ticketIds.length}{" "}
              {saleResult.ticketIds.length === 1
                ? "entrada generada"
                : "entradas generadas"}
            </p>
          </div>
        </div>

        <div className="space-y-2 border p-4">
          <div className="space-y-2 ">
            <p className="text-sm text-neutral-900">
              <span className="font-semibold text-neutral-900">Evento:</span>{" "}
              {eventTitle}
            </p>
            <p className="text-sm text-neutral-900">
              <span className="font-semibold text-neutral-900">
                Tipo de entrada:
              </span>{" "}
              {selectedTicketTitle}
            </p>
            <p className="text-sm text-neutral-900">
              <span className="font-semibold text-neutral-900">Generado:</span>{" "}
              {formattedDate}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {saleResult.ticketIds.map((ticketId, idx) => (
              <div
                key={ticketId}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-700"
              >
                <p className="text-xs text-neutral-50 uppercase tracking-widest">
                  Entrada {idx + 1} de {saleResult.ticketIds.length}
                </p>
                <div className="bg-white p-2 rounded-lg">
                  <Image
                    src={`/api/tickets/qr/${ticketId}`}
                    alt={`QR entrada ${idx + 1}`}
                    width={200}
                    height={200}
                    className="block"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-neutral-500 font-mono">{ticketId}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownloadPdf}
            className="flex-1 bg-ey-turquoise cursor-pointer text-neutral-900 font-bold hover:bg-ey-turquoise/70"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 cursor-pointer"
          >
            <Zap className="mr-2 h-4 w-4" />
            Nueva Venta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="rounded-xl border border-neutral-700 bg-neutral-900/50 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-ey-turquoise" />
          <p className="font-semibold text-sm">¿Cómo funciona la Venta Rápida?</p>
        </div>
        <ul className="text-sm text-neutral-400 space-y-1 list-disc list-inside">
          <li>Generá entradas en segundos, ideal para venta en puerta.</li>
          <li>No se solicitan datos personales del comprador.</li>
          <li>Las entradas se registran con datos genéricos de la productora.</li>
          <li>No se envía email — los QR se muestran en pantalla para escanear o imprimir.</li>
          <li>El stock se descuenta automáticamente igual que en cualquier venta.</li>
        </ul>
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-neutral-900 font-bold">
            Tipo de entrada
          </label>
          <Select
            value={selectedTicketTypeId}
            onValueChange={(value) => {
              const ticket = tickets.find((t) => t.id === value);
              if (ticket) {
                setMaxQty(computeMaxQty(ticket, soldTickets));
                setSelectedTicketTitle(ticket.title);
              }
              setSelectedTicketTypeId(value);
              setQuantity("1");
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de entrada" />
            </SelectTrigger>
            <SelectContent>
              {tickets.map((ticket) => {
                const soldCount = soldTickets?.[ticket.id]?.count ?? 0;
                const bGet = ticket.buyGet || 1;
                const effectiveSold = soldCount / bGet;
                const isSoldOut = ticket.quantity <= effectiveSold;

                return (
                  <SelectItem
                    key={ticket.id}
                    value={ticket.id}
                    disabled={
                      isSoldOut ||
                      ticket.status === "SOLDOUT" ||
                      (ticket.endDate != null && isPastEndDate(ticket.endDate))
                    }
                  >
                    {ticket.title} — ${ticket.price}
                    {isSoldOut ? " (Agotado)" : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-200">
            Cantidad
          </label>
          <Select
            value={quantity}
            onValueChange={setQuantity}
            disabled={!selectedTicketTypeId || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="1" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <Button
        className="w-full py-6 shadow-md bg-ey-turquoise text-neutral-900 font-bold hover:bg-ey-turquoise/70 transition-colors duration-500"
        onClick={handleSubmit}
        disabled={!selectedTicketTypeId || isLoading}
      >
        {isLoading ? (
          "Generando..."
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Generar Venta Rápida
          </>
        )}
      </Button>
    </div>
  );
}
