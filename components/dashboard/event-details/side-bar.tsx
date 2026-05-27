"use client";

import type React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SideBarProps {
  salesStats: React.ReactNode;
  eventStockCap: number | null;
}

export default function SideBar({
  salesStats,
  eventStockCap,
}: SideBarProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {salesStats}
        </CardContent>

        {eventStockCap !== null && (
          <>
            <Separator />
            <CardHeader>
              <CardTitle>Stock del evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Tope asignado:{" "}
                <span className="font-medium text-foreground">
                  {eventStockCap} tickets
                </span>
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}
