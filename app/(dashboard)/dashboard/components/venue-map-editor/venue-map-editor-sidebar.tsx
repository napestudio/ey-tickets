"use client";

import { useVenueEditorStore } from "./use-venue-editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const ELEMENTS_WITH_SECTOR = ["ROW", "TABLE"] as const;

export function VenueMapEditorSidebar() {
  const {
    elements,
    sectors,
    selectedId,
    removeElement,
    updateElementLabel,
    updateElementColor,
    updateElementSector,
    rotateElement,
    updateRowConfig,
  } = useVenueEditorStore();

  const selected = elements.find((el) => el.localId === selectedId);

  if (!selected) {
    return (
      <div className="w-60 shrink-0 border-l bg-muted/20 flex items-center justify-center p-4">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Seleccioná un elemento para editar sus propiedades
        </p>
      </div>
    );
  }

  const canHaveSector = (ELEMENTS_WITH_SECTOR as readonly string[]).includes(
    selected.type,
  );
  const isRow = selected.type === "ROW";
  const rotation = selected.rotation ?? 0;

  // Find current sector's color for the preview
  const assignedSector = sectors.find((s) => s.localId === selected.sectorId);

  return (
    <div className="w-60 shrink-0 border-l bg-muted/20 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium truncate">
          {isRow
            ? `Fila ${selected.rowLabel ?? ""}`
            : selected.label || selected.type}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
          onClick={() => removeElement(selected.localId)}
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="p-3 space-y-4 flex-1">
        {/* Sector selector (ROW and TABLE) */}
        {canHaveSector && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Sector</Label>
            {sectors.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Primero creá un sector en el panel izquierdo.
              </p>
            ) : (
              <Select
                value={selected.sectorId ?? "__none__"}
                onValueChange={(v) =>
                  updateElementSector(
                    selected.localId,
                    v === "__none__" ? null : v,
                  )
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sin sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">Sin sector</span>
                  </SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s.localId} value={s.localId}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* ROW configuration */}
        {isRow && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Configuración de fila
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Prefijo</Label>
                <Input
                  className="h-7 text-xs"
                  value={selected.rowLabel ?? ""}
                  placeholder="A"
                  onChange={(e) =>
                    updateRowConfig(selected.localId, {
                      rowLabel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nro. inicial</Label>
                <Input
                  className="h-7 text-xs"
                  type="number"
                  min={1}
                  value={selected.startNumber ?? 1}
                  onChange={(e) =>
                    updateRowConfig(selected.localId, {
                      startNumber: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Butacas</Label>
                <Input
                  className="h-7 text-xs"
                  type="number"
                  min={1}
                  max={200}
                  value={selected.seatCount ?? 10}
                  onChange={(e) =>
                    updateRowConfig(selected.localId, {
                      seatCount: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Espaciado (px)</Label>
                <Input
                  className="h-7 text-xs"
                  type="number"
                  min={16}
                  max={60}
                  value={selected.seatSpacing ?? 28}
                  onChange={(e) =>
                    updateRowConfig(selected.localId, {
                      seatSpacing: parseInt(e.target.value) || 28,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Patrón de numeración</Label>
              <Select
                value={selected.seatPattern ?? "ALL"}
                onValueChange={(v) =>
                  updateRowConfig(selected.localId, {
                    seatPattern: v as "ALL" | "ODD" | "EVEN",
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos (1, 2, 3…)</SelectItem>
                  <SelectItem value="ODD">Solo impares (1, 3, 5…)</SelectItem>
                  <SelectItem value="EVEN">Solo pares (2, 4, 6…)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Orden</Label>
              <Select
                value={selected.orderDirection ?? "ASC"}
                onValueChange={(v) =>
                  updateRowConfig(selected.localId, {
                    orderDirection: v as "ASC" | "DESC",
                  })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascendente (1, 2, 3…)</SelectItem>
                  <SelectItem value="DESC">Descendente (10, 9, 8…)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Label (non-ROW elements that show a label) */}
        {!isRow && (
          <div className="space-y-1">
            <Label className="text-xs">Etiqueta</Label>
            <Input
              className="h-7 text-xs"
              value={selected.label ?? ""}
              placeholder="Nombre"
              onChange={(e) =>
                updateElementLabel(selected.localId, e.target.value)
              }
            />
          </div>
        )}

        {/* Color (non-ROW, non-TABLE — those use sector color) */}
        {!isRow && selected.type !== "TABLE" && (
          <div className="space-y-1">
            <Label className="text-xs">Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-7 w-10 rounded border cursor-pointer"
                value={selected.color ?? "#6b7280"}
                onChange={(e) =>
                  updateElementColor(selected.localId, e.target.value)
                }
              />
              <span className="text-xs text-muted-foreground font-mono">
                {selected.color ?? "#6b7280"}
              </span>
            </div>
          </div>
        )}

        {/* Rotation (ROW and TABLE) */}
        {(isRow || selected.type === "TABLE") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Rotación</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {Math.round(rotation)}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={359}
              step={1}
              value={Math.round(rotation)}
              onChange={(e) =>
                rotateElement(selected.localId, parseInt(e.target.value))
              }
              className="w-full accent-primary"
            />
            <div className="flex gap-1">
              {[0, 45, 90, 135, 180, 270].map((deg) => (
                <Button
                  key={deg}
                  variant="outline"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] flex-1"
                  onClick={() => rotateElement(selected.localId, deg)}
                  type="button"
                >
                  {deg}°
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Position info */}
        <div className="text-[10px] text-muted-foreground space-y-0.5 pt-2 border-t">
          <p>
            Posición: col {selected.x}, fila {selected.y}
          </p>
          {!isRow && (
            <p>
              Tamaño: {selected.width} × {selected.height} celdas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
