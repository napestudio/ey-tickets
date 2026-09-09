"use client";

import { useState, useEffect } from "react";
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
import { AlertCircle } from "lucide-react";
import { VenueElementType, EditorElement, ELEMENT_COLORS } from "@/types/venue";

const ELEMENT_TITLES: Record<VenueElementType, string> = {
  ROW: "Nueva fila de butacas",
  STAGE: "Nuevo escenario",
  TABLE: "Nueva mesa",
  ENTRANCE: "Nueva entrada",
  EXIT: "Nueva salida",
  TEXT: "Nuevo texto",
};

function generateNumbers(
  startNumber: number,
  seatCount: number,
  seatPattern: "ALL" | "ODD" | "EVEN",
): number[] {
  const result: number[] = [];
  let n = startNumber;
  while (result.length < seatCount) {
    const include =
      seatPattern === "ALL" ||
      (seatPattern === "ODD" && n % 2 !== 0) ||
      (seatPattern === "EVEN" && n % 2 === 0);
    if (include) result.push(n);
    n++;
    if (n > startNumber + seatCount * 3) break;
  }
  return result;
}

function getNextStartNumber(
  elements: EditorElement[],
  rowLabel: string,
  seatPattern: "ALL" | "ODD" | "EVEN",
): number {
  const samePrefix = elements.filter(
    (el) => el.type === "ROW" && el.rowLabel === rowLabel,
  );
  if (samePrefix.length === 0) return 1;

  let maxNum = 0;
  for (const row of samePrefix) {
    const nums = generateNumbers(
      row.startNumber ?? 1,
      row.seatCount ?? 10,
      (row.seatPattern ?? "ALL") as "ALL" | "ODD" | "EVEN",
    );
    const rowMax = Math.max(...nums);
    if (rowMax > maxNum) maxNum = rowMax;
  }

  if (seatPattern === "ODD") return maxNum % 2 === 0 ? maxNum + 1 : maxNum + 2;
  if (seatPattern === "EVEN") return maxNum % 2 === 0 ? maxNum + 2 : maxNum + 1;
  return maxNum + 1;
}

function hasNumberConflict(
  elements: EditorElement[],
  rowLabel: string,
  startNumber: number,
  seatCount: number,
  seatPattern: "ALL" | "ODD" | "EVEN",
): boolean {
  const samePrefix = elements.filter(
    (el) => el.type === "ROW" && el.rowLabel === rowLabel,
  );
  if (samePrefix.length === 0) return false;

  const newNums = new Set(generateNumbers(startNumber, seatCount, seatPattern));
  for (const row of samePrefix) {
    const existing = generateNumbers(
      row.startNumber ?? 1,
      row.seatCount ?? 10,
      (row.seatPattern ?? "ALL") as "ALL" | "ODD" | "EVEN",
    );
    if (existing.some((n) => newNums.has(n))) return true;
  }
  return false;
}

interface CreateElementDialogProps {
  type: VenueElementType;
  onClose: () => void;
}

export function CreateElementDialog({ type, onClose }: CreateElementDialogProps) {
  const { sectors, elements, addElementFull } = useVenueEditorStore();

  const isRow = type === "ROW";
  const isTable = type === "TABLE";
  const canHaveSector = isRow || isTable;

  // Shared
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(ELEMENT_COLORS[type]);

  // ROW
  const [rowLabel, setRowLabel] = useState("A");
  const [startNumber, setStartNumber] = useState(1);
  const [seatCount, setSeatCount] = useState(10);
  const [seatPattern, setSeatPattern] = useState<"ALL" | "ODD" | "EVEN">("ALL");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");

  // TABLE
  const [tableCapacity, setTableCapacity] = useState(4);

  // Auto-suggest startNumber when rowLabel or seatPattern changes
  useEffect(() => {
    if (!isRow) return;
    const next = getNextStartNumber(elements, rowLabel, seatPattern);
    setStartNumber(next);
  }, [rowLabel, seatPattern, isRow, elements]);

  const sectorRequired = canHaveSector && sectors.length > 0 && !sectorId;
  const conflict =
    isRow &&
    hasNumberConflict(elements, rowLabel, startNumber, seatCount, seatPattern);
  const canSubmit = !conflict && !sectorRequired;

  function handleConfirm() {
    if (!canSubmit) return;

    addElementFull({
      type,
      label: label || undefined,
      sectorId: canHaveSector ? sectorId : undefined,
      color: !isRow && !isTable ? color : undefined,
      ...(isRow && {
        rowLabel: rowLabel || "A",
        startNumber,
        seatCount,
        seatPattern,
        orderDirection,
      }),
      ...(isTable && { tableCapacity }),
    });
    onClose();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{ELEMENT_TITLES[type]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Sector selector — required for ROW and TABLE */}
          {canHaveSector && (
            <div className="space-y-1.5">
              <Label>
                Sector
                <span className="ml-1 text-destructive">*</span>
              </Label>
              {sectors.length === 0 ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Necesitás al menos un sector. Crealo desde el botón &quot;Sectores&quot; antes de agregar este elemento.
                  </span>
                </div>
              ) : (
                <Select
                  value={sectorId ?? ""}
                  onValueChange={(v) => setSectorId(v || null)}
                >
                  <SelectTrigger
                    className={sectorRequired ? "border-destructive" : ""}
                  >
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

          {/* ROW config */}
          {isRow && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Configuración de fila
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prefijo</Label>
                  <Input
                    value={rowLabel}
                    placeholder="A"
                    onChange={(e) => setRowLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Butacas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={seatCount}
                    onChange={(e) =>
                      setSeatCount(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Numeración</Label>
                  <Select
                    value={seatPattern}
                    onValueChange={(v) =>
                      setSeatPattern(v as "ALL" | "ODD" | "EVEN")
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
                    value={orderDirection}
                    onValueChange={(v) =>
                      setOrderDirection(v as "ASC" | "DESC")
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
              <div className="space-y-1.5">
                <Label>Nro. inicial</Label>
                <Input
                  type="number"
                  min={1}
                  value={startNumber}
                  onChange={(e) =>
                    setStartNumber(parseInt(e.target.value) || 1)
                  }
                />
              </div>

              {conflict && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    La fila &quot;{rowLabel}&quot; ya tiene butacas con esos
                    números. Cambiá el número inicial para evitar conflictos.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TABLE config */}
          {isTable && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Etiqueta (opcional)</Label>
                <Input
                  value={label}
                  placeholder="Mesa VIP"
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Capacidad (personas)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={tableCapacity}
                  onChange={(e) =>
                    setTableCapacity(parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>
          )}

          {/* Other elements */}
          {!isRow && !isTable && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Etiqueta</Label>
                <Input
                  value={label}
                  placeholder="Nombre"
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-8 w-10 rounded border cursor-pointer"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground font-mono">
                    {color}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit} type="button">
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
