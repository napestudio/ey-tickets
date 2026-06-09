"use client";

import type React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EventStockCard, { EventStockDetails } from "@/components/dashboard/event-stock-card";

interface SideBarProps {
  salesStats: React.ReactNode;
  eventStock: EventStockDetails | null;
}

export default function SideBar({ salesStats, eventStock }: SideBarProps) {
  return (
    <>
      {eventStock != null && <EventStockCard eventStock={eventStock} />}
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{salesStats}</CardContent>
      </Card>
    </>
  );
}
