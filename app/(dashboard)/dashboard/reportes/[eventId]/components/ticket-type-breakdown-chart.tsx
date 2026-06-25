"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { TicketTypeBreakdown } from "@/types/reportes";

interface TicketTypeBreakdownChartProps {
  data: TicketTypeBreakdown[];
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: TicketTypeBreakdown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-background border rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p>Tickets vendidos: <span className="font-semibold">{row.ticketsSold.toLocaleString("es-AR")}</span></p>
      <p>Ingresos: <span className="font-semibold">{formatPrice(row.revenue)}</span></p>
      <p>Participación: <span className="font-semibold">{row.sharePercent.toFixed(1)}%</span></p>
    </div>
  );
}

export default function TicketTypeBreakdownChart({
  data,
}: TicketTypeBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de entrada más vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="ticketTypeTitle"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="ticketsSold"
              name="Tickets vendidos"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
