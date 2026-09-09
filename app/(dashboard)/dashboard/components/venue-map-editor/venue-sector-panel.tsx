"use client";

import { useVenueEditorStore } from "./use-venue-editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { SECTOR_PALETTE } from "@/types/venue";

export function VenueSectorPanel() {
  const { sectors, addSector, removeSector, updateSectorName, updateSectorColor } =
    useVenueEditorStore();

  return (
    <div className="w-52 shrink-0 border-r bg-muted/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sectores
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={addSector}
          type="button"
          title="Agregar sector"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sectors.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 leading-relaxed">
            Creá sectores para agrupar las filas de butacas.
          </p>
        )}

        {sectors.map((sector) => (
          <div
            key={sector.localId}
            className="border rounded-md p-2 bg-background/50 space-y-2"
          >
            {/* Color + name row */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <div
                  className="w-6 h-6 rounded-full border border-border cursor-pointer"
                  style={{ backgroundColor: sector.color }}
                />
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                  value={sector.color}
                  onChange={(e) =>
                    updateSectorColor(sector.localId, e.target.value)
                  }
                  title="Cambiar color"
                />
              </div>
              <Input
                className="h-7 text-xs flex-1 min-w-0"
                value={sector.name}
                placeholder="Nombre del sector"
                onChange={(e) =>
                  updateSectorName(sector.localId, e.target.value)
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSector(sector.localId)}
                type="button"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Quick palette */}
            <div className="flex gap-1 flex-wrap">
              {SECTOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: sector.color === c ? "white" : "transparent",
                  }}
                  onClick={() => updateSectorColor(sector.localId, c)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Elements palette below sectors */}
      <div className="border-t">
        <ElementsPalette />
      </div>
    </div>
  );
}

function ElementsPalette() {
  const { addElement } = useVenueEditorStore();

  const items = [
    { type: "ROW" as const, label: "Fila de butacas", icon: "○○○" },
    { type: "STAGE" as const, label: "Escenario", icon: "▬" },
    { type: "TABLE" as const, label: "Mesa", icon: "◼" },
    { type: "ENTRANCE" as const, label: "Entrada", icon: "→" },
    { type: "EXIT" as const, label: "Salida", icon: "←" },
    { type: "TEXT" as const, label: "Texto", icon: "T" },
  ];

  return (
    <div className="p-2 space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide px-1 pb-0.5">
        Agregar elemento
      </p>
      {items.map(({ type, label, icon }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs h-7 gap-2 font-normal"
          onClick={() => addElement(type)}
          type="button"
        >
          <span className="font-mono text-[11px] w-6 text-center">{icon}</span>
          {label}
        </Button>
      ))}
    </div>
  );
}
