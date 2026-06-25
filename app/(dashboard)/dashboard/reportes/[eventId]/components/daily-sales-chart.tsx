"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { DailySalesPoint } from "@/types/reportes";

interface DailySalesChartProps {
  data: DailySalesPoint[];
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: DailySalesPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function formatDisplayDate(dateStr: string): string {
  // dateStr is 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-background border rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label ? formatDisplayDate(label) : ""}</p>
      <p>Tickets vendidos: <span className="font-semibold">{row.ticketsSold.toLocaleString("es-AR")}</span></p>
      <p>Órdenes: <span className="font-semibold">{row.orderCount.toLocaleString("es-AR")}</span></p>
      <p>Ingresos: <span className="font-semibold">{formatPrice(row.revenue)}</span></p>
    </div>
  );
}

export default function DailySalesChart({ data }: DailySalesChartProps) {
  const displayData = data.map((d) => ({
    ...d,
    label: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de ventas por día</CardTitle>
        <CardDescription>Tickets vendidos a lo largo del tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={displayData}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ticketsSold"
              name="Tickets vendidos"
              stroke="hsl(var(--primary))"
              fill="url(#colorSales)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
