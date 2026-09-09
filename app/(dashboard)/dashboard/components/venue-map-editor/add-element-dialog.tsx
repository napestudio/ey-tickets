"use client";

import { useState } from "react";
import { useVenueEditorStore } from "./use-venue-editor-store";
import { VenueElementType } from "@/types/venue";
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

const ELEMENT_TYPE_OPTIONS: { value: VenueElementType; label: string }[] = [
  { value: "ROW", label: "Fila de butacas" },
  { value: "STAGE", label: "Escenario" },
  { value: "TABLE", label: "Mesa" },
  { value: "ENTRANCE", label: "Entrada" },
  { value: "EXIT", label: "Salida" },
  { value: "TEXT", label: "Texto" },
];

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddElementDialog({ open, onOpenChange }: AddElementDialogProps) {
  const { sectors, addElementFull } = useVenueEditorStore();

  const [type, setType] = useState<VenueElementType>("ROW");
  const [label, setLabel] = useState("");
  const [sectorId, setSectorId] = useState<string>("");
  const [rowLabel, setRowLabel] = useState("A");
  const [startNumber, setStartNumber] = useState(1);
  const [seatCount, setSeatCount] = useState(10);
  const [seatSpacing, setSeatSpacing] = useState(28);
  const [seatPattern, setSeatPattern] = useState<"ALL" | "ODD" | "EVEN">("ALL");
  const [orderDirection, setOrderDirection] = useState<"ASC" | "DESC">("ASC");

  function resetForm() {
    setType("ROW");
    setLabel("");
    setSectorId("");
    setRowLabel("A");
    setStartNumber(1);
    setSeatCount(10);
    setSeatSpacing(28);
    setSeatPattern("ALL");
    setOrderDirection("ASC");
  }

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function handleAdd() {
    addElementFull({
      type,
      label: label || undefined,
      sectorId: sectorId || null,
      rowLabel: type === "ROW" ? rowLabel : undefined,
      startNumber: type === "ROW" ? startNumber : undefined,
      seatCount: type === "ROW" ? seatCount : undefined,
      seatPattern: type === "ROW" ? seatPattern : undefined,
      orderDirection: type === "ROW" ? orderDirection : undefined,
      seatSpacing: type === "ROW" ? seatSpacing : undefined,
    });
    handleClose();
  }

  const isRow = type === "ROW";
  const canHaveSector = type === "ROW" || type === "TABLE";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar elemento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label>Tipo de elemento</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as VenueElementType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ELEMENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector (ROW and TABLE) */}
          {canHaveSector && sectors.length > 0 && (
            <div className="space-y-1.5">
              <Label>Sector</Label>
              <Select
                value={sectorId || "__none__"}
                onValueChange={(v) => setSectorId(v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin sector</SelectItem>
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
            </div>
          )}

          {/* ROW config */}
          {isRow && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Prefijo de fila</Label>
                  <Input
                    value={rowLabel}
                    onChange={(e) => setRowLabel(e.target.value)}
                    placeholder="A"
                  />
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
                <div className="space-y-1.5">
                  <Label>Cantidad de butacas</Label>
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
                  <Label>Espaciado (px)</Label>
                  <Input
                    type="number"
                    min={16}
                    max={60}
                    value={seatSpacing}
                    onChange={(e) =>
                      setSeatSpacing(parseInt(e.target.value) || 28)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
            </>
          )}

          {/* Label (non-ROW) */}
          {!isRow && (
            <div className="space-y-1.5">
              <Label>Etiqueta</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Nombre del elemento"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button onClick={handleAdd} type="button">
            Agregar al mapa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
