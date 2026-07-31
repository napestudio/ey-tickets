"use client";

import type React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface SideBarProps {
  salesStats: React.ReactNode;
}

export default function SideBar({ salesStats }: SideBarProps) {
  return (
    <>
      <Card className="bg-ey-turquoise text-neutral-950">
        <CardHeader className="-mb-4">
          <CardTitle>Ventas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">{salesStats}</CardContent>
      </Card>
    </>
  );
}
