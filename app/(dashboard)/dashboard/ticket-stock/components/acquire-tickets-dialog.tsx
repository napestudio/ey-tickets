"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  PACKAGE_CATALOG,
  getUnitPriceForQuantity,
} from "@/lib/ticket-stock-catalog";
import PurchasePackageDialog from "./purchase-package-dialog";

interface AcquireTicketsDialogProps {
  producerId: string;
}

export default function AcquireTicketsDialog({
  producerId,
}: AcquireTicketsDialogProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<{
    quantity: number;
    unitPrice: number;
  } | null>(null);
  const [customQty, setCustomQty] = useState("");

  const parsedCustomQty = parseInt(customQty, 10);
  const customUnitPrice =
    !isNaN(parsedCustomQty) && parsedCustomQty >= 1
      ? getUnitPriceForQuantity(parsedCustomQty)
      : PACKAGE_CATALOG[0].unitPrice;

  function handleSelectPackage(quantity: number, unitPrice: number) {
    setCatalogOpen(false);
    setSelected({ quantity, unitPrice });
    setConfirmOpen(true);
  }

  function handleCustomPurchase() {
    const qty = parseInt(customQty, 10);
    if (isNaN(qty) || qty < 1) return;
    setCustomQty("");
    handleSelectPackage(qty, getUnitPriceForQuantity(qty));
  }

  function handleConfirmClose(v: boolean) {
    setConfirmOpen(v);
    if (!v) setSelected(null);
  }

  return (
    <>
      <Button onClick={() => setCatalogOpen(true)}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Adquirir tickets
      </Button>

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adquirir tickets</DialogTitle>
            <DialogDescription>
              Seleccioná un paquete o ingresá una cantidad personalizada para
              agregar tickets a tu pool.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Paquetes predefinidos */}
            <div className="grid gap-4 sm:grid-cols-3">
              {PACKAGE_CATALOG.map((pkg) => (
                <div
                  key={pkg.quantity}
                  className="border rounded-lg p-4 space-y-3 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {pkg.quantity.toLocaleString("es-AR")}
                    </span>
                    <Badge variant="secondary">tickets</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      {formatPrice(pkg.unitPrice)}{" "}
                      <span className="text-xs">por ticket</span>
                    </p>
                    <p className="font-semibold text-foreground text-base">
                      Total: {formatPrice(pkg.totalPrice)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      handleSelectPackage(pkg.quantity, pkg.unitPrice)
                    }
                  >
                    Comprar
                  </Button>
                </div>
              ))}
            </div>

            {/* Cantidad personalizada */}
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Cantidad personalizada</p>
              <div className="flex gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="custom-qty"
                    className="text-xs text-muted-foreground"
                  >
                    Cantidad de tickets
                  </Label>
                  <Input
                    id="custom-qty"
                    type="number"
                    min={1}
                    placeholder="Ej: 250"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomPurchase();
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleCustomPurchase}
                  disabled={!customQty || parseInt(customQty, 10) < 1}
                >
                  Comprar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Precio por ticket:{" "}
                <span className="font-bold">
                  {formatPrice(customUnitPrice)}
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selected && (
        <PurchasePackageDialog
          open={confirmOpen}
          onOpenChange={handleConfirmClose}
          producerId={producerId}
          quantity={selected.quantity}
          unitPrice={selected.unitPrice}
        />
      )}
    </>
  );
}
