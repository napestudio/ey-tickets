import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Ticket,
  ShoppingCart,
  Users,
  Tag,
} from "lucide-react";
import type { EventDetailedStats } from "@/types/reportes";

interface EventStatsSummaryProps {
  stats: EventDetailedStats;
}

export default function EventStatsSummary({ stats }: EventStatsSummaryProps) {
  const isPositive = stats.profit >= 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Fila 1: Ventas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tickets vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTicketsSold.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Órdenes pagadas, sin invitaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrders.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOrders > 0
                ? `${(stats.totalTicketsSold / stats.totalOrders).toFixed(1)} tickets por orden`
                : "Sin ventas"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Precio promedio
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.averageTicketPrice)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por ticket vendido (incluye descuentos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Con descuento / promo
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.discountedOrders.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalOrders > 0
                ? `${((stats.discountedOrders / stats.totalOrders) * 100).toFixed(1)}% de las órdenes`
                : "Sin órdenes"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fila 2: Finanzas y asistencia */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suma de órdenes pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo estimado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.estimatedCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalTicketsSold} tickets × {formatPrice(stats.wac)}/u (CPP)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia neta</CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isPositive ? "" : "text-destructive"}`}
            >
              {formatPrice(stats.profit)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {stats.margin !== null && (
                <Badge variant={isPositive ? "secondary" : "destructive"}>
                  {stats.margin.toFixed(1)}%
                </Badge>
              )}
              <p className="text-xs text-muted-foreground">margen sobre ingresos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de asistencia
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.attendanceRate !== null
                ? `${stats.attendanceRate.toFixed(1)}%`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.validatedTickets.toLocaleString("es-AR")} de{" "}
              {stats.totalTicketsSold.toLocaleString("es-AR")} tickets validados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
