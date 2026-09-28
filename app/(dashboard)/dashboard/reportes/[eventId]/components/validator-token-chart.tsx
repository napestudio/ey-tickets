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
import type { ValidatorTokenBreakdown } from "@/types/reportes";

interface ValidatorTokenChartProps {
  data: ValidatorTokenBreakdown[];
}

interface TooltipPayload {
  value: number;
  name: string;
  payload: ValidatorTokenBreakdown;
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
      <p className="font-medium mb-1">{row.label}</p>
      <p>
        Entradas validadas:{" "}
        <span className="font-semibold">{row.validatedCount.toLocaleString("es-AR")}</span>
      </p>
    </div>
  );
}

export default function ValidatorTokenChart({ data }: ValidatorTokenChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validación por puerta / dispositivo</CardTitle>
        <CardDescription>Entradas validadas agrupadas por token de validador</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              interval={0}
              angle={data.length > 4 ? -20 : 0}
              textAnchor={data.length > 4 ? "end" : "middle"}
              height={data.length > 4 ? 50 : 30}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="validatedCount"
              name="Entradas validadas"
              fill="var(--color-ey-turquoise-dark)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
