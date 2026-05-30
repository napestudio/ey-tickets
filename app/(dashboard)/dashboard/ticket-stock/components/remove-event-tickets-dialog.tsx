"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { assignEventAllocationAction, removeEventAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Minus, Plus } from "lucide-react";

interface AllocationInfo {
  eventId: string;
  eventTitle: string;
  quantity: number;
  ticketTypesQuantity: number;
  ticketsSold: number;
}

interface RemoveEventTicketsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
  allocation: AllocationInfo;
}

export default function RemoveEventTicketsDialog({
  open,
  onOpenChange,
  producerId,
  allocation,
}: RemoveEventTicketsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Tickets libres = asignados - en tipos de ticket (mínimo que debe quedar)
  const removable = allocation.quantity - allocation.ticketTypesQuantity;
  const [toRemove, setToRemove] = useState(1);

  useEffect(() => {
    if (open) setToRemove(Math.min(1, removable));
  }, [open, removable]);

  const newTotal = allocation.quantity - toRemove;
  const returningToPool = toRemove;

  function handleClose(v: boolean) {
    if (!v) setToRemove(Math.min(1, removable));
    onOpenChange(v);
  }

  const decrement = () => setToRemove((p) => Math.max(1, p - 1));
  const increment = () => setToRemove((p) => Math.min(removable, p + 1));

  function handleSubmit() {
    startTransition(async () => {
      try {
        if (newTotal === 0) {
          await removeEventAllocationAction(allocation.eventId);
          toast({
            title: "Asignación eliminada",
            description: `Se liberaron ${returningToPool} tickets al pool general.`,
          });
        } else {
          await assignEventAllocationAction(producerId, allocation.eventId, newTotal);
          toast({
            title: "Tickets quitados",
            description: `Se liberaron ${returningToPool} tickets al pool general.`,
          });
        }
        handleClose(false);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : "No se pudo actualizar la asignación.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quitar tickets del evento</DialogTitle>
          <DialogDescription>{allocation.eventTitle}</DialogDescription>
        </DialogHeader>

        {/* Estado actual del evento */}
        <div className="rounded-md border bg-muted/40 p-3 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Asignados al evento</p>
            <p className="font-semibold">{allocation.quantity.toLocaleString("es-AR")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Vendidos</p>
            <p className="font-semibold">{allocation.ticketsSold.toLocaleString("es-AR")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">En tipos de ticket</p>
            <p className="font-semibold text-amber-600">
              {allocation.ticketTypesQuantity.toLocaleString("es-AR")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Disponibles para quitar</p>
            <p className={`font-semibold ${removable === 0 ? "text-muted-foreground" : "text-green-700 dark:text-green-400"}`}>
              {removable.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        {removable === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2">
            No hay tickets disponibles para quitar. Todos los tickets asignados están en uso en tipos de ticket del evento.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">Tickets a quitar</p>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={decrement}
                disabled={toRemove <= 1 || isPending}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-16 text-center text-lg font-semibold tabular-nums">
                {toRemove.toLocaleString("es-AR")}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={increment}
                disabled={toRemove >= removable || isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {removable > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 ml-1"
                  onClick={() => setToRemove(removable)}
                  disabled={isPending}
                >
                  Quitar todos ({removable.toLocaleString("es-AR")})
                </Button>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quedarán en el evento</span>
                <span className="font-semibold">{newTotal.toLocaleString("es-AR")} tickets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vuelven al pool</span>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  +{returningToPool.toLocaleString("es-AR")} tickets
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || removable === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Quitar {toRemove > 0 ? toRemove.toLocaleString("es-AR") : ""} tickets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
