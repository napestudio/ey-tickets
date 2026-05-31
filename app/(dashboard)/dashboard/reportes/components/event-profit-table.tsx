import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventProfitRow } from "@/types/ticket-stock";

interface EventProfitTableProps {
  events: EventProfitRow[];
}

const EVENT_STATUS_MAP: Record<
  string,
  { label: string; variant: "secondary" | "destructive" | "outline" }
> = {
  ACTIVE: { label: "Activo", variant: "secondary" },
  DRAFT: { label: "Borrador", variant: "outline" },
  ENDED: { label: "Finalizado", variant: "outline" },
  CANCELED: { label: "Cancelado", variant: "destructive" },
};

function formatARS(value: number) {
  return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatCurrencyARS(value: number) {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function EventProfitTable({ events }: EventProfitTableProps) {
  const eventsWithSales = events.filter((e) => e.ticketsSold > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganancias por evento</CardTitle>
      </CardHeader>
      <CardContent>
        {eventsWithSales.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay eventos con ventas registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">
                    Evento
                  </th>
                  <th className="text-left py-2 font-medium text-muted-foreground pl-4">
                    Estado
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Tickets vendidos
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Ingresos
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Costo est.
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Ganancia
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    Margen
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventsWithSales.map((row) => {
                  const statusInfo = EVENT_STATUS_MAP[row.eventStatus] ?? {
                    label: row.eventStatus,
                    variant: "outline" as const,
                  };
                  const isPositive = row.profit >= 0;

                  return (
                    <tr key={row.eventId} className="border-b last:border-0">
                      <td className="py-3 font-medium">{row.eventTitle}</td>
                      <td className="py-3 pl-4">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {row.ticketsSold.toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 text-right">
                        {formatARS(row.revenue)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatARS(row.estimatedCost)}
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${isPositive ? "" : "text-destructive"}`}
                      >
                        {formatCurrencyARS(row.profit)}
                      </td>
                      <td className="py-3 text-right">
                        {row.margin !== null ? (
                          <Badge
                            variant={isPositive ? "secondary" : "destructive"}
                          >
                            {row.margin.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
