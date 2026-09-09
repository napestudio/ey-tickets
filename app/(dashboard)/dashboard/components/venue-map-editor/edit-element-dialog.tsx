"use client";

import { useVenueEditorStore } from "./use-venue-editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, AlertCircle } from "lucide-react";

const ELEMENT_LABELS: Record<string, string> = {
  ROW: "Fila de butacas",
  STAGE: "Escenario",
  TABLE: "Mesa",
  ENTRANCE: "Entrada",
  EXIT: "Salida",
  TEXT: "Texto",
};

interface EditElementDialogProps {
  elementLocalId: string | null;
  onClose: () => void;
}

export function EditElementDialog({
  elementLocalId,
  onClose,
}: EditElementDialogProps) {
  const {
    elements,
    sectors,
    removeElement,
    updateElementLabel,
    updateElementColor,
    updateElementSector,
    updateRowConfig,
    updateTableCapacity,
  } = useVenueEditorStore();

  const element = elements.find((el) => el.localId === elementLocalId);
  const assignedSector = sectors.find((s) => s.localId === element?.sectorId);

  const isRow = element?.type === "ROW";
  const isTable = element?.type === "TABLE";
  const canHaveSector = element?.type === "ROW" || element?.type === "TABLE";

  // Conflict check: rows with the same prefix must have unique seat numbers
  const rowConflict = (() => {
    if (!element || !isRow) return false;
    const label = element.rowLabel ?? "";
    const start = element.startNumber ?? 1;
    const count = element.seatCount ?? 10;
    const pattern = (element.seatPattern ?? "ALL") as "ALL" | "ODD" | "EVEN";
    const newNums = new Set<number>();
    let n = start;
    while (newNums.size < count) {
      const include =
        pattern === "ALL" ||
        (pattern === "ODD" && n % 2 !== 0) ||
        (pattern === "EVEN" && n % 2 === 0);
      if (include) newNums.add(n);
      n++;
      if (n > start + count * 3) break;
    }
    return elements
      .filter(
        (el) =>
          el.type === "ROW" &&
          el.rowLabel === label &&
          el.localId !== element.localId,
      )
      .some((row) => {
        const s = row.startNumber ?? 1;
        const c = row.seatCount ?? 10;
        const p = (row.seatPattern ?? "ALL") as "ALL" | "ODD" | "EVEN";
        let rn = s;
        let found = false;
        let cnt = 0;
        while (cnt < c) {
          const inc =
            p === "ALL" ||
            (p === "ODD" && rn % 2 !== 0) ||
            (p === "EVEN" && rn % 2 === 0);
          if (inc) {
            if (newNums.has(rn)) {
              found = true;
              break;
            }
            cnt++;
          }
          rn++;
          if (rn > s + c * 3) break;
        }
        return found;
      });
  })();

  function handleDelete() {
    if (!element) return;
    removeElement(element.localId);
    onClose();
  }

  return (
    <Dialog
      open={!!elementLocalId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {element
              ? isRow
                ? `Fila ${element.rowLabel ?? ""}`
                : element.label || ELEMENT_LABELS[element.type] || element.type
              : "Elemento"}
          </DialogTitle>
        </DialogHeader>

        {element && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {/* Sector selector — required for ROW and TABLE */}
            {canHaveSector && (
              <div className="space-y-1.5">
                <Label>Sector</Label>
                {sectors.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Sin sectores disponibles.
                  </p>
                ) : (
                  <Select
                    value={element.sectorId ?? ""}
                    onValueChange={(v) =>
                      updateElementSector(element.localId, v || null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná un sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s.localId} value={s.localId}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
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

            {/* TABLE capacity */}
            {isTable && (
              <div className="space-y-1.5">
                <Label>Capacidad (personas)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={element.tableCapacity ?? 4}
                  onChange={(e) =>
                    updateTableCapacity(
                      element.localId,
                      parseInt(e.target.value) || 1,
                    )
                  }
                />
              </div>
            )}

            {/* ROW configuration */}
            {isRow && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Configuración de fila
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Prefijo</Label>
                    <Input
                      value={element.rowLabel ?? ""}
                      placeholder="A"
                      onChange={(e) =>
                        updateRowConfig(element.localId, {
                          rowLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nro. inicial</Label>
                    <Input
                      type="number"
                      min={1}
                      value={element.startNumber ?? 1}
                      onChange={(e) =>
                        updateRowConfig(element.localId, {
                          startNumber: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Butacas</Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={element.seatCount ?? 10}
                      onChange={(e) =>
                        updateRowConfig(element.localId, {
                          seatCount: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
                {rowConflict && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Otra fila &quot;{element.rowLabel}&quot; ya usa esos
                      números. Cambiá el número inicial para evitar conflictos.
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Numeración</Label>
                    <Select
                      value={element.seatPattern ?? "ALL"}
                      onValueChange={(v) =>
                        updateRowConfig(element.localId, {
                          seatPattern: v as "ALL" | "ODD" | "EVEN",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos (1, 2, 3…)</SelectItem>
                        <SelectItem value="ODD">Impares (1, 3, 5…)</SelectItem>
                        <SelectItem value="EVEN">Pares (2, 4, 6…)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Orden</Label>
                    <Select
                      value={element.orderDirection ?? "ASC"}
                      onValueChange={(v) =>
                        updateRowConfig(element.localId, {
                          orderDirection: v as "ASC" | "DESC",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">Ascendente</SelectItem>
                        <SelectItem value="DESC">Descendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Label (non-ROW) */}
            {!isRow && (
              <div className="space-y-1.5">
                <Label>Etiqueta</Label>
                <Input
                  value={element.label ?? ""}
                  placeholder="Nombre"
                  onChange={(e) =>
                    updateElementLabel(element.localId, e.target.value)
                  }
                />
              </div>
            )}

            {/* Color (non-ROW, non-TABLE — those use sector color) */}
            {!isRow && element.type !== "TABLE" && (
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-10 rounded border cursor-pointer"
                    value={element.color ?? "#6b7280"}
                    onChange={(e) =>
                      updateElementColor(element.localId, e.target.value)
                    }
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {element.color ?? "#6b7280"}
                  </span>
                </div>
              </div>
            )}

            {/* Position info */}
            <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t">
              <p>
                Posición: col {element.x}, fila {element.y}
              </p>
              {!isRow && (
                <p>
                  Tamaño: {element.width} × {element.height} celdas
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onClose}
            type="button"
            className="bg-ey-turquoise-dark hover:bg-ey-turquoise-dark/90 transition-colors"
          >
            Aplicar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
