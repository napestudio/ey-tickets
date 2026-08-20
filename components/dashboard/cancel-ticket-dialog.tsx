"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cancelTicketOrderAction } from "@/lib/actions";

type TicketSummary = {
  id: string;
  code?: number | null;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
  dni?: string | null;
  createdAt: Date;
  ticketType?: { title?: string | null } | null;
  order?: {
    email?: string | null;
    ticketType?: { title?: string | null } | null;
  } | null;
};

interface CancelTicketDialogProps {
  ticket: TicketSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelTicketDialog({
  ticket,
  onClose,
  onSuccess,
}: CancelTicketDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"cancel" | "refund" | null>(null);

  const open = ticket !== null;

  function handleClose() {
    if (loading) return;
    setReason("");
    onClose();
  }

  async function handleSubmit(refunded: boolean) {
    if (!ticket || !reason.trim()) return;

    const mode = refunded ? "refund" : "cancel";
    setLoading(mode);

    try {
      await cancelTicketOrderAction(
        ticket.id,
        reason.trim(),
        undefined,
        refunded,
      );
      toast({ title: "Entrada cancelada correctamente." });
      setReason("");
      onSuccess();
      onClose();
    } catch (err) {
      toast({
        title:
          err instanceof Error ? err.message : "Error al cancelar la entrada.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  const ticketTypeTitle =
    ticket?.ticketType?.title ?? ticket?.order?.ticketType?.title ?? "—";
  const buyerName = ticket
    ? [ticket.name, ticket.lastName].filter(Boolean).join(" ") ||
      ticket.order?.email?.split("@")[0] ||
      "—"
    : "—";
  const email = ticket?.email ?? ticket?.order?.email ?? "—";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar entrada</DialogTitle>
          <DialogDescription>
            Esta acción marcará la entrada como cancelada. El QR dejará de ser
            válido. La devolución del dinero corre por cuenta de la Productora.
          </DialogDescription>
        </DialogHeader>

        {ticket && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1.5 text-sm bg-muted/40">
              <div className="flex justify-between">
                <span className="text-muted-foreground">N.°</span>
                <span className="font-medium">
                  {ticket.code != null
                    ? String(ticket.code).padStart(5, "0")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comprador</span>
                <span className="font-medium">{buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium truncate max-w-[60%] text-right">
                  {email}
                </span>
              </div>
              {ticket.dni && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI</span>
                  <span className="font-medium">{ticket.dni}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span className="font-medium">{ticketTypeTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de venta</span>
                <span className="font-medium">
                  {format(ticket.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancel-reason">
                Motivo de cancelación{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Ej: Solicitud del comprador, error en la compra..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                disabled={!!loading}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={!!loading}
            className="sm:mr-auto"
          >
            Cerrar
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={!!loading || !reason.trim()}
          >
            {loading === "refund" ? "Cancelando..." : "Cancelar y reembolsar"}
          </Button> */}
          <Button
            variant="destructive"
            onClick={() => handleSubmit(false)}
            disabled={!!loading || !reason.trim()}
          >
            {loading === "cancel" ? "Cancelando..." : "Cancelar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
