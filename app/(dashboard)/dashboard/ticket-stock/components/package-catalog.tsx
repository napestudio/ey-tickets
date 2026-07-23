"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PACKAGE_CATALOG, getUnitPriceForQuantity } from "@/lib/ticket-stock-catalog";
import PurchasePackageDialog from "./purchase-package-dialog";
import { formatPrice } from "@/lib/utils";

interface PackageCatalogProps {
  producerId: string;
}

export default function PackageCatalog({ producerId }: PackageCatalogProps) {
  const [selected, setSelected] = useState<{
    quantity: number;
    unitPrice: number;
  } | null>(null);
  const [customQty, setCustomQty] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const parsedCustomQty = parseInt(customQty, 10);
  const customUnitPrice =
    !isNaN(parsedCustomQty) && parsedCustomQty >= 1
      ? getUnitPriceForQuantity(parsedCustomQty)
      : PACKAGE_CATALOG[0].unitPrice;

  function handleSelectPackage(quantity: number, unitPrice: number) {
    setSelected({ quantity, unitPrice });
    setDialogOpen(true);
  }

  function handleCustomPurchase() {
    const qty = parseInt(customQty, 10);
    if (isNaN(qty) || qty < 1) return;
    setSelected({ quantity: qty, unitPrice: getUnitPriceForQuantity(qty) });
    setDialogOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adquirir tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
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
                  onClick={() => handleSelectPackage(pkg.quantity, pkg.unitPrice)}
                >
                  Comprar
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Cantidad personalizada</p>
            <div className="flex gap-3 items-end">
              <div className="space-y-1 flex-1">
                <Label htmlFor="custom-qty" className="text-xs text-muted-foreground">
                  Cantidad de tickets
                </Label>
                <Input
                  id="custom-qty"
                  type="number"
                  min={1}
                  placeholder="Ej: 250"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
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
            <p className="text-xs text-muted-foreground">
              Precio por ticket: {formatPrice(customUnitPrice)}
            </p>
          </div>
        </CardContent>
      </Card>

      {selected && (
        <PurchasePackageDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          producerId={producerId}
          quantity={selected.quantity}
          unitPrice={selected.unitPrice}
        />
      )}
    </>
  );
}
