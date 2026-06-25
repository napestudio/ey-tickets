import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { PaymentMethodInfo } from "@/types/reportes";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  DIGITAL: "Digital (MercadoPago)",
  TRANSFER: "Transferencia",
};

interface PaymentMethodsPanelProps {
  paymentMethods: PaymentMethodInfo[];
  totalRevenue: number;
  baseProfit: number;
  revenueUntracked: number;
  ordersUntracked: number;
}

export default function PaymentMethodsPanel({
  paymentMethods,
  totalRevenue,
  baseProfit,
  revenueUntracked,
  ordersUntracked,
}: PaymentMethodsPanelProps) {
  const methodsWithCommission = paymentMethods.filter(
    (pm) => pm.commissionPercentage !== null && pm.commissionPercentage > 0
  );

  // Actual total commission paid (sum over all tracked methods)
  const totalCommissionActual = paymentMethods.reduce(
    (sum, pm) => sum + pm.commissionActual,
    0
  );
  const netProfitActual = baseProfit - totalCommissionActual;
  const hasTrackedOrders = paymentMethods.some((pm) => pm.ordersTracked > 0);
  const hasCommissions = methodsWithCommission.length > 0;
  const hasUntrackedOrders = ordersUntracked > 0;

  // Worst-case scenario (for untracked portion)
  const maxCommissionCost =
    methodsWithCommission.length > 0
      ? Math.max(
          ...methodsWithCommission.map((pm) => pm.commissionCostIfAll)
        )
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis de costos y comisiones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">

        {/* Waterfall de costos */}
        <div className="rounded-lg border p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ingresos brutos</span>
            <span className="font-semibold">{formatPrice(totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              (-) Costo de capital (CPP × tickets)
            </span>
            <span className="font-medium text-destructive">
              -{formatPrice(totalRevenue - baseProfit > 0 ? totalRevenue - baseProfit : 0)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Ganancia antes de comisiones</span>
            <span className={baseProfit >= 0 ? "" : "text-destructive"}>
              {formatPrice(baseProfit)}
            </span>
          </div>

          {hasCommissions && hasTrackedOrders && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  (-) Comisiones rastreadas
                </span>
                <span className="font-medium text-destructive">
                  -{formatPrice(totalCommissionActual)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Ganancia neta (rastreada)</span>
                <span className={netProfitActual >= 0 ? "" : "text-destructive"}>
                  {formatPrice(netProfitActual)}
                </span>
              </div>
              {hasUntrackedOrders && (
                <div className="text-xs text-muted-foreground italic pt-1">
                  {ordersUntracked} órdenes sin método registrado (
                  {formatPrice(revenueUntracked)} en ingresos) no están incluidas en el cálculo.
                </div>
              )}
            </>
          )}

          {hasCommissions && !hasTrackedOrders && (
            <>
              <div className="pt-1 text-xs text-muted-foreground italic">
                Rango estimado de comisiones (sin rastreo exacto por orden):
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  Comisión máxima (si todo fue por el método más caro)
                </span>
                <span className="font-medium text-destructive">
                  -{formatPrice(maxCommissionCost)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Ganancia neta estimada</span>
                <span className="text-muted-foreground">
                  {formatPrice(baseProfit - maxCommissionCost)} —{" "}
                  {formatPrice(baseProfit)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Detalle por método */}
        <div>
          <p className="text-sm font-medium mb-3">
            Métodos configurados para este evento
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((pm) => {
              const hasCommission =
                pm.commissionPercentage !== null &&
                pm.commissionPercentage > 0;
              const isNetPositive = pm.netProfitIfAll >= 0;
              const isActualPositive =
                baseProfit - pm.commissionActual >= 0;

              return (
                <div
                  key={pm.paymentMethodId}
                  className="rounded-lg border p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">
                        {pm.name ?? PAYMENT_TYPE_LABELS[pm.type] ?? pm.type}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {PAYMENT_TYPE_LABELS[pm.type] ?? pm.type}
                      </Badge>
                    </div>
                    {hasCommission ? (
                      <Badge variant="secondary" className="shrink-0">
                        {pm.commissionPercentage}%
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-muted-foreground"
                      >
                        Sin comisión
                      </Badge>
                    )}
                  </div>

                  {/* Datos reales rastreados */}
                  {pm.ordersTracked > 0 && (
                    <div className="text-sm space-y-1.5 border-t pt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>
                          Rastreado: {pm.ordersTracked} órdenes ({formatPrice(pm.revenueTracked)})
                        </span>
                      </div>
                      {hasCommission && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Comisión real:
                            </span>
                            <span className="font-medium text-destructive">
                              -{formatPrice(pm.commissionActual)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Ganancia neta (rastreada):
                            </span>
                            <span
                              className={`font-semibold ${isActualPositive ? "" : "text-destructive"}`}
                            >
                              {formatPrice(baseProfit - pm.commissionActual)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Escenario hipotético (siempre visible si hay comisión) */}
                  {hasCommission && (
                    <div className="text-sm space-y-1.5 border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-1 italic">
                        Si el 100% pasó por este método:
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Comisión:</span>
                        <span className="font-medium text-destructive">
                          -{formatPrice(pm.commissionCostIfAll)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">
                          Ganancia final:
                        </span>
                        <span
                          className={`font-semibold text-sm ${isNetPositive ? "" : "text-destructive"}`}
                        >
                          {formatPrice(pm.netProfitIfAll)}
                          {pm.marginIfAll !== null && (
                            <span className="text-xs font-normal ml-1 text-muted-foreground">
                              ({pm.marginIfAll.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nota sobre órdenes sin rastreo */}
        {hasUntrackedOrders && hasCommissions && (
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              {ordersUntracked} órdenes ({formatPrice(revenueUntracked)}) no
              tienen método de pago registrado. Esto corresponde a órdenes
              creadas antes de que el sistema comenzara a rastrear este dato.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
