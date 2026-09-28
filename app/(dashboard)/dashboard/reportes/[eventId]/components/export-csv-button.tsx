"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { EventDetailedStats } from "@/types/reportes";

function formatCsvValue(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(...values: (string | number)[]): string {
  return values.map(formatCsvValue).join(",");
}

function buildCsv(stats: EventDetailedStats): string {
  const lines: string[] = [];

  // ── Resumen financiero ───────────────────────────────────────────────────
  lines.push(row("RESUMEN FINANCIERO"));
  lines.push(row("Evento", stats.eventTitle));
  lines.push(row("Entradas emitidas (físicas, incl. invitaciones)", stats.totalTicketsIssued));
  lines.push(row("Tickets vendidos", stats.ticketOrdersIssued));
  lines.push(row("Invitaciones", stats.invitationTickets));
  lines.push(row("Órdenes totales", stats.totalOrders));
  lines.push(row("Órdenes con descuento/promo", stats.discountedOrders));
  lines.push(row("Ingresos totales ($)", stats.totalRevenue.toLocaleString("es-AR", { maximumFractionDigits: 0 })));
  lines.push(row("Tickets validados", stats.validatedTickets));
  lines.push(row("Primer venta", stats.dateRange.earliest ?? "N/A"));
  lines.push(row("Última venta", stats.dateRange.latest ?? "N/A"));

  // ── Desglose por tipo de ticket ──────────────────────────────────────────
  lines.push("");
  lines.push(row("DESGLOSE POR TIPO DE TICKET"));
  lines.push(
    row("Tipo", "Tickets vendidos", "Ingresos ($)", "Precio promedio ($)", "% del total")
  );
  for (const tt of stats.ticketTypeBreakdown) {
    lines.push(
      row(
        tt.ticketTypeTitle,
        tt.ticketsSold,
        tt.revenue.toFixed(2),
        tt.avgPrice.toFixed(2),
        tt.sharePercent.toFixed(1)
      )
    );
  }

  return lines.join("\n");
}

interface ExportCsvButtonProps {
  stats: EventDetailedStats;
}

export default function ExportCsvButton({ stats }: ExportCsvButtonProps) {
  function handleExport() {
    const csv = buildCsv(stats);
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = stats.eventTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    link.href = url;
    link.download = `reporte-${slug}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Exportar CSV
    </Button>
  );
}
