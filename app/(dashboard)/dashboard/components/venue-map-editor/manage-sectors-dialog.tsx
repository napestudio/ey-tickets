"use client";

import { useVenueEditorStore } from "./use-venue-editor-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";

interface ManageSectorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageSectorsDialog({
  open,
  onOpenChange,
}: ManageSectorsDialogProps) {
  const {
    sectors,
    addSector,
    removeSector,
    updateSectorName,
    updateSectorColor,
  } = useVenueEditorStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sectores</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {sectors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay sectores. Creá uno para organizar las filas y mesas.
            </p>
          ) : (
            sectors.map((sector) => (
              <div
                key={sector.localId}
                className="flex items-center gap-2 p-2 border rounded-md bg-muted/20"
              >
                <input
                  type="color"
                  value={sector.color}
                  onChange={(e) =>
                    updateSectorColor(sector.localId, e.target.value)
                  }
                  className="h-8 w-8 rounded cursor-pointer border-0 p-0 flex-shrink-0"
                  title="Color del sector"
                />
                <Input
                  value={sector.name}
                  onChange={(e) =>
                    updateSectorName(sector.localId, e.target.value)
                  }
                  className="h-8 flex-1"
                  placeholder="Nombre del sector"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => removeSector(sector.localId)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={addSector}
          variant="outline"
          className="w-full gap-2"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Agregar sector
        </Button>
      </DialogContent>
    </Dialog>
  );
}
