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
import type { ValidationHourlyPoint } from "@/types/reportes";

interface ValidationHourlyChartProps {
  data: ValidationHourlyPoint[];
}

// Build a full 24-hour array, filling 0 for hours with no validations
function buildFullDayData(data: ValidationHourlyPoint[]): ValidationHourlyPoint[] {
  const map = new Map(data.map((d) => [d.hour, d]));
  return Array.from({ length: 24 }, (_, hour) => map.get(hour) ?? { hour, validatedCount: 0 });
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}hs`;
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: ValidationHourlyPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-background border rounded-lg p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{formatHour(row.hour)}</p>
      <p>
        Entradas validadas:{" "}
        <span className="font-semibold">{row.validatedCount.toLocaleString("es-AR")}</span>
      </p>
    </div>
  );
}

export default function ValidationHourlyChart({ data }: ValidationHourlyChartProps) {
  const fullData = buildFullDayData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de ingreso</CardTitle>
        <CardDescription>
          Cuándo se validaron las entradas en la puerta (no cuándo se compraron)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={fullData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              tick={{ fontSize: 10 }}
              className="fill-muted-foreground"
              interval={1}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="validatedCount"
              name="Entradas validadas"
              fill="var(--color-ey-turquoise-dark)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
