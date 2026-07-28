"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { purchaseTicketPackageAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PurchasePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
  quantity: number;
  unitPrice: number;
}

export default function PurchasePackageDialog({
  open,
  onOpenChange,
  producerId,
  quantity,
  unitPrice,
}: PurchasePackageDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const totalPrice = quantity * unitPrice;

  function handleConfirm() {
    startTransition(async () => {
      // Abrir la pestaña en blanco ANTES del await para mantener el contexto
      // de gesto del usuario y evitar que el bloqueador de popups lo bloquee
      const newTab = window.open("", "_blank");

      try {
        const checkoutUrl = await purchaseTicketPackageAction(
          producerId,
          quantity
        );

        if (checkoutUrl && newTab) {
          newTab.location.href = checkoutUrl;
          onOpenChange(false);
          toast({
            title: "Checkout abierto",
            description:
              "Completá el pago en la nueva pestaña. El stock se acreditará automáticamente.",
          });
        } else {
          newTab?.close();
          throw new Error("No se recibió la URL de pago.");
        }
      } catch {
        newTab?.close();
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo procesar la compra. Intentá de nuevo.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar compra</DialogTitle>
          <DialogDescription>
            Estás por adquirir un paquete de tickets para tu productora. El
            pago se completará en una nueva pestaña.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cantidad de tickets</span>
            <span className="font-medium">
              {quantity.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio por ticket</span>
            <span className="font-medium">{formatPrice(unitPrice)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t pt-3">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ir al pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
