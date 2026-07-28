"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { TicketPackagePaymentStatus, TicketPackageStatus } from "@/types/ticket-stock";

interface PackageRow {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: TicketPackageStatus;
  paymentStatus: TicketPackagePaymentStatus;
  purchasedAt: Date;
  notes: string | null;
}

interface PackageHistoryTableProps {
  packages: PackageRow[];
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: "secondary" | "destructive" | "outline" }
> = {
  ACTIVE: { label: "Activo", variant: "secondary" },
  EXPIRED: { label: "Expirado", variant: "outline" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
};

const PAYMENT_STATUS_MAP: Record<
  TicketPackagePaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PAID: { label: "Pagado", variant: "default" },
  PENDING: { label: "Pendiente", variant: "outline" },
  FAILED: { label: "Fallido", variant: "destructive" },
  REFUNDED: { label: "Reembolsado", variant: "secondary" },
};

export default function PackageHistoryTable({
  packages,
}: PackageHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de compra</CardTitle>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no adquiriste ningún paquete.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">
                    Fecha
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Cantidad
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Precio / ticket
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left py-2 font-medium text-muted-foreground">
                    Pago
                  </th>
                  <th className="text-left py-2 font-medium text-muted-foreground">
                    Notas
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => {
                  const paymentBadge = PAYMENT_STATUS_MAP[pkg.paymentStatus];
                  return (
                    <tr key={pkg.id} className="border-b last:border-0">
                      <td className="py-3">
                        {new Date(pkg.purchasedAt).toLocaleDateString("es-AR")}
                      </td>
                      <td className="py-3 text-right">
                        {pkg.quantity.toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 text-right">
                        {formatPrice(pkg.unitPrice)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatPrice(pkg.totalPrice)}
                      </td>
                      <td className="py-3">
                        <Badge variant={paymentBadge.variant}>
                          {paymentBadge.label}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {pkg.notes ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
