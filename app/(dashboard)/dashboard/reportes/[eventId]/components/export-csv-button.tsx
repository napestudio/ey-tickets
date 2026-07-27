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
  lines.push(row("Campo", "Valor"));
  lines.push(row("Evento", stats.eventTitle));
  lines.push(row("Estado", stats.eventStatus));
  lines.push(row("Tickets vendidos", stats.totalTicketsSold));
  lines.push(row("Órdenes pagadas", stats.totalOrders));
  lines.push(row("Precio promedio por ticket", stats.averageTicketPrice.toFixed(2)));
  lines.push(row("Tickets validados", stats.validatedTickets));
  lines.push(
    row(
      "Tasa de asistencia (%)",
      stats.attendanceRate !== null ? stats.attendanceRate.toFixed(1) : "N/A"
    )
  );
  lines.push(row("Órdenes con descuento/promo", stats.discountedOrders));
  lines.push(row("Descuentos otorgados ($)", stats.totalDiscountsGiven.toFixed(2)));
  lines.push(row("Ingresos totales ($)", stats.totalRevenue.toFixed(2)));
  lines.push(row("Cargo de servicio cobrado ($)", stats.totalServiceCharges.toFixed(2)));
  lines.push(row("Ingresos netos de tickets ($)", stats.netTicketRevenue.toFixed(2)));
  lines.push(row("CPP / WAC por ticket ($)", stats.wac.toFixed(2)));
  lines.push(row("Costo estimado ($)", stats.estimatedCost.toFixed(2)));
  lines.push(row("Ganancia bruta ($)", stats.profit.toFixed(2)));
  lines.push(
    row(
      "Margen bruto (%)",
      stats.margin !== null ? stats.margin.toFixed(1) : "N/A"
    )
  );
  lines.push(
    row("Ganancia s/cargo de servicio ($)", stats.ticketProfit.toFixed(2))
  );
  lines.push(row("Ingresos sin método de pago ($)", stats.revenueUntracked.toFixed(2)));
  lines.push(row("Órdenes sin método de pago", stats.ordersUntracked));
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

  // ── Ventas diarias ───────────────────────────────────────────────────────
  if (stats.dailySales.length > 0) {
    lines.push("");
    lines.push(row("VENTAS DIARIAS"));
    lines.push(row("Fecha", "Órdenes", "Tickets vendidos", "Ingresos ($)"));
    for (const d of stats.dailySales) {
      lines.push(row(d.date, d.orderCount, d.ticketsSold, d.revenue.toFixed(2)));
    }
  }

  // ── Ventas por hora ──────────────────────────────────────────────────────
  if (stats.hourlySales.length > 0) {
    lines.push("");
    lines.push(row("VENTAS POR HORA"));
    lines.push(row("Hora", "Órdenes", "Tickets vendidos", "Ingresos ($)"));
    for (const h of stats.hourlySales) {
      lines.push(
        row(`${String(h.hour).padStart(2, "0")}:00`, h.orderCount, h.ticketsSold, h.revenue.toFixed(2))
      );
    }
  }

  // ── Ventas por día de la semana ──────────────────────────────────────────
  const weekdayWithSales = stats.weekdaySales.filter((d) => d.ticketsSold > 0);
  if (weekdayWithSales.length > 0) {
    lines.push("");
    lines.push(row("VENTAS POR DÍA DE LA SEMANA"));
    lines.push(row("Día", "Órdenes", "Tickets vendidos"));
    for (const w of stats.weekdaySales) {
      lines.push(row(w.label, w.orderCount, w.ticketsSold));
    }
  }

  // ── Métodos de pago ──────────────────────────────────────────────────────
  if (stats.paymentMethods.length > 0) {
    lines.push("");
    lines.push(row("MÉTODOS DE PAGO"));
    lines.push(
      row(
        "Método",
        "Tipo",
        "Comisión (%)",
        "Ingresos rastreados ($)",
        "Órdenes rastreadas",
        "Comisión real ($)",
        "Ganancia neta estimada ($)"
      )
    );
    for (const pm of stats.paymentMethods) {
      lines.push(
        row(
          pm.name ?? pm.paymentMethodId,
          pm.type,
          pm.commissionPercentage !== null ? pm.commissionPercentage.toFixed(2) : "N/A",
          pm.revenueTracked.toFixed(2),
          pm.ordersTracked,
          pm.commissionActual.toFixed(2),
          pm.netProfitIfAll.toFixed(2)
        )
      );
    }
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
