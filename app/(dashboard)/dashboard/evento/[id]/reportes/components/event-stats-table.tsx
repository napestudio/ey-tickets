import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import type { EventDetailedStats } from "@/types/reportes";

interface EventStatsTableProps {
  stats: EventDetailedStats;
}

export default function EventStatsTable({ stats }: EventStatsTableProps) {
  // Every count here is physical (one QR per event date per unit sold or
  // invited), so they reconcile: Entradas emitidas = Tickets vendidos +
  // Invitaciones, and Entradas validadas is measured against Entradas
  // emitidas (validators scan sold and invited QRs the same way).
  const rows: { label: string; value: string; detail?: string }[] = [
    {
      label: "Entradas emitidas",
      value: stats.totalTicketsIssued.toLocaleString("es-AR"),
    },
    {
      label: "Tickets vendidos",
      value: stats.ticketOrdersIssued.toLocaleString("es-AR"),
    },
    {
      label: "Invitaciones",
      value: stats.invitationTickets.toLocaleString("es-AR"),
    },
    {
      label: "Órdenes totales",
      value: stats.totalOrders.toLocaleString("es-AR"),
    },
    {
      label: "Entradas validadas",
      value: `${stats.validatedTickets.toLocaleString("es-AR")} de ${stats.totalTicketsIssued.toLocaleString("es-AR")}`,
    },
    {
      label: "Ingresos totales",
      value: formatPrice(stats.totalRevenue),
    },
  ];

  return (
    <Card className="rounded-none">
      <CardContent className="p-0">
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} className="hover:bg-transparent">
                <TableCell className="font-medium text-neutral-950">
                  {row.label}
                  <div className="font-extrabold text-xl">{row.value}</div>
                  {row.detail && (
                    <div className="text-xs text-neutral-950 mt-0.5">
                      {row.detail}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
