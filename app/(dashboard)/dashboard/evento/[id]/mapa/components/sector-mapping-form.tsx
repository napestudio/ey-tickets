"use client";

import { VenueSector } from "@/types/venue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TicketTypeOption {
  id: string;
  title: string;
  price: number | string;
}

interface SectorMappingFormProps {
  sectors: VenueSector[];
  ticketTypes: TicketTypeOption[];
  mappings: Record<string, string>; // venueSectorId → ticketTypeId
  onChange: (venueSectorId: string, ticketTypeId: string) => void;
}

export function SectorMappingForm({
  sectors,
  ticketTypes,
  mappings,
  onChange,
}: SectorMappingFormProps) {
  if (sectors.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Esta sala no tiene sectores configurados. Editá el mapa y agregá sectores.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sectors.map((sector) => (
        <div
          key={sector.id ?? sector.name}
          className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border rounded-md bg-muted/20"
        >
          {/* Sector color badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: sector.color }}
            />
            <p className="text-sm font-medium truncate">
              {sector.name || "Sin nombre"}
            </p>
          </div>

          {/* Ticket type selector */}
          <div className="sm:w-60">
            <Label className="text-xs text-muted-foreground mb-1 block">
              Tipo de entrada
            </Label>
            <Select
              value={mappings[sector.id ?? ""] ?? ""}
              onValueChange={(v) => onChange(sector.id ?? "", v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Seleccioná un tipo..." />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>
                    {tt.title}{" "}
                    <span className="text-muted-foreground text-xs">
                      ${Number(tt.price).toLocaleString("es-AR")}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}
