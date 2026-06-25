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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { WeekdaySalesPoint } from "@/types/reportes";

interface WeekdaySalesChartProps {
  data: WeekdaySalesPoint[];
}

interface TooltipPayload {
  value: number;
  payload: WeekdaySalesPoint;
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
      <p>
        Tickets vendidos:{" "}
        <span className="font-semibold">
          {row.ticketsSold.toLocaleString("es-AR")}
        </span>
      </p>
      <p>
        Órdenes:{" "}
        <span className="font-semibold">
          {row.orderCount.toLocaleString("es-AR")}
        </span>
      </p>
    </div>
  );
}

export default function WeekdaySalesChart({ data }: WeekdaySalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por día de la semana</CardTitle>
        <CardDescription>
          Útil para planificar el lanzamiento de futuros eventos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 13 }}
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
