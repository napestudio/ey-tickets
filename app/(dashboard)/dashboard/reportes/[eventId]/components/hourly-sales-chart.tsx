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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { HourlySalesPoint } from "@/types/reportes";

interface HourlySalesChartProps {
  data: HourlySalesPoint[];
}

// Build a full 24-hour array, filling 0 for hours with no sales
function buildFullDayData(data: HourlySalesPoint[]): HourlySalesPoint[] {
  const map = new Map(data.map((d) => [d.hour, d]));
  return Array.from({ length: 24 }, (_, hour) =>
    map.get(hour) ?? { hour, orderCount: 0, ticketsSold: 0, revenue: 0 }
  );
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}hs`;
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: HourlySalesPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-background border rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{formatHour(row.hour)}</p>
      <p>Tickets vendidos: <span className="font-semibold">{row.ticketsSold.toLocaleString("es-AR")}</span></p>
      <p>Órdenes: <span className="font-semibold">{row.orderCount.toLocaleString("es-AR")}</span></p>
      {row.revenue > 0 && (
        <p>Ingresos: <span className="font-semibold">{formatPrice(row.revenue)}</span></p>
      )}
    </div>
  );
}

export default function HourlySalesChart({ data }: HourlySalesChartProps) {
  const fullData = buildFullDayData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de venta</CardTitle>
        <CardDescription>Distribución de tickets vendidos por hora del día (Argentina)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={fullData}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              interval={1}
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
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
