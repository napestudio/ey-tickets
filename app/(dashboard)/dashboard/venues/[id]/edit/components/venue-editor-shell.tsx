"use client";

import { VenueMapEditor } from "@/app/(dashboard)/dashboard/components/venue-map-editor/venue-map-editor";
import { Venue } from "@/types/venue";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/dashboard/dashboard-header";

interface VenueEditorShellProps {
  venue: Venue & {
    sectors?: NonNullable<Venue["sectors"]>;
    elements?: NonNullable<Venue["elements"]>;
  };
}

export function VenueEditorShell({ venue }: VenueEditorShellProps) {
  return (
    <div className="flex flex-col h-screen">
      {/* Header - matching event edit page style */}
      <div className="px-4 md:px-6 py-4 border-b bg-background shrink-0 space-y-3">
        <DashboardHeader
          title={venue.name}
          subtitle="Editá el mapa del venue"
        />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/venues">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a los mapas
          </Link>
        </Button>
      </div>

      {/* Editor (fills remaining height) */}
      <div className="flex-1 overflow-hidden">
        <VenueMapEditor
          venueId={venue.id}
          initialSectors={venue.sectors ?? []}
          initialElements={venue.elements ?? []}
          gridWidth={venue.widthCells}
          gridHeight={venue.heightCells}
        />
      </div>
    </div>
  );
}
