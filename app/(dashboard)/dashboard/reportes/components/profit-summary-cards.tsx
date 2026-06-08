import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ProfitReport } from "@/types/ticket-stock";
import { DollarSign, TrendingUp, TrendingDown, Package, Warehouse } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProfitSummaryCardsProps {
  report: ProfitReport;
}

export default function ProfitSummaryCards({ report }: ProfitSummaryCardsProps) {
  const {
    wac,
    totalRevenue,
    totalEstimatedCost,
    totalProfit,
    totalMargin,
    inventoryValue,
    totalPackageCost,
  } = report;

  const isPositive = totalProfit >= 0;

  return (
    <div className="flex flex-col gap-4">
      {totalPackageCost === 0 && (
        <Alert>
          <AlertDescription>
            Aún no compraste paquetes de tickets. El costo estimado es $0 hasta que registres tu primera compra.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPP por ticket</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(wac)}</div>
            <p className="text-xs text-muted-foreground mt-1">Costo promedio ponderado de compra</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Suma de ventas PAID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo de ventas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalEstimatedCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital recuperado por ventas</p>
          </CardContent>
        </Card>

        <Card className={isPositive ? "" : "border-destructive"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia neta</CardTitle>
            <TrendingUp className={`h-4 w-4 ${isPositive ? "text-muted-foreground" : "text-destructive"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? "" : "text-destructive"}`}>
              {formatPrice(totalProfit)}
            </div>
            {totalMargin !== null ? (
              <Badge
                variant={isPositive ? "secondary" : "destructive"}
                className="mt-1 text-xs"
              >
                {totalMargin.toFixed(1)}% margen
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Sin ventas registradas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventario en stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(inventoryValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital inmovilizado en tickets sin vender</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        El costo estimado se calcula usando el costo promedio ponderado (CPP) de todos los paquetes activos y vencidos.
        Los tickets no vendidos que retornan al pool no se cargan como costo de ningún evento.
      </p>
    </div>
  );
}
