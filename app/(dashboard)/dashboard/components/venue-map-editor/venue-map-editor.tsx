"use client";

import { useState, useEffect, useTransition } from "react";
import { useVenueEditorStore } from "./use-venue-editor-store";
import { VenueMapEditorCanvas } from "./venue-map-editor-canvas";
import { ManageSectorsDialog } from "./manage-sectors-dialog";
import { EditElementDialog } from "./edit-element-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateElementDialog } from "./create-element-dialog";
import { saveVenueMapAction } from "@/lib/actions";
import { VenueElement, VenueSector, VenueElementType } from "@/types/venue";
import { toast } from "@/components/ui/use-toast";
import {
  Save,
  Loader2,
  Layers,
  Plus,
  Rows3,
  Presentation,
  Circle,
  DoorOpen,
  LogOut,
  Type,
} from "lucide-react";

interface VenueMapEditorProps {
  venueId: string;
  initialSectors: VenueSector[];
  initialElements: VenueElement[];
  gridWidth: number;
  gridHeight: number;
}

const ELEMENT_OPTIONS: {
  type: VenueElementType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "ROW", label: "Fila de butacas", icon: <Rows3 className="h-4 w-4" /> },
  { type: "STAGE", label: "Escenario", icon: <Presentation className="h-4 w-4" /> },
  { type: "TABLE", label: "Mesa", icon: <Circle className="h-4 w-4" /> },
  { type: "ENTRANCE", label: "Entrada", icon: <DoorOpen className="h-4 w-4" /> },
  { type: "EXIT", label: "Salida", icon: <LogOut className="h-4 w-4" /> },
  { type: "TEXT", label: "Texto", icon: <Type className="h-4 w-4" /> },
];

export function VenueMapEditor({
  venueId,
  initialSectors,
  initialElements,
  gridWidth,
  gridHeight,
}: VenueMapEditorProps) {
  const { loadFromSaved, sectors, elements, isDirty, markSaved } =
    useVenueEditorStore();
  const [isPending, startTransition] = useTransition();

  const [sectorsDialogOpen, setSectorsDialogOpen] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [creatingType, setCreatingType] = useState<VenueElementType | null>(null);

  useEffect(() => {
    loadFromSaved(initialSectors, initialElements, gridWidth, gridHeight);
  }, [loadFromSaved, initialSectors, initialElements, gridWidth, gridHeight]);

  function handleSave() {
    startTransition(async () => {
      try {
        const sectorPayload: VenueSector[] = sectors.map(
          ({ localId: _l, ...rest }) => rest
        );
        const elementPayload: VenueElement[] = elements.map(
          ({ localId: _l, isDirty: _d, id, ...rest }) => ({ ...rest, id })
        );

        await saveVenueMapAction(venueId, sectorPayload, elementPayload);
        markSaved();
        toast({ title: "Mapa guardado correctamente." });
      } catch (error) {
        toast({
          title: "Error al guardar",
          description:
            error instanceof Error ? error.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {sectors.length} sector{sectors.length !== 1 ? "es" : ""} ·{" "}
            {elements.length} elemento{elements.length !== 1 ? "s" : ""}
          </span>
          {isDirty && (
            <span className="text-xs text-amber-500 font-medium">
              • Cambios sin guardar
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSectorsDialogOpen(true)}
            className="gap-2"
            type="button"
          >
            <Layers className="h-4 w-4" />
            Sectores
          </Button>

          {/* Add element dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" type="button">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Tipo de elemento
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ELEMENT_OPTIONS.map(({ type, label, icon }) => (
                <DropdownMenuItem
                  key={type}
                  className="gap-2 cursor-pointer"
                  onSelect={() => setCreatingType(type)}
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar mapa
          </Button>
        </div>
      </div>

      {/* Full-width canvas */}
      <VenueMapEditorCanvas
        onElementDoubleClick={(localId) => setEditingElementId(localId)}
      />

      {/* Dialogs */}
      <ManageSectorsDialog
        open={sectorsDialogOpen}
        onOpenChange={setSectorsDialogOpen}
      />
      <EditElementDialog
        elementLocalId={editingElementId}
        onClose={() => setEditingElementId(null)}
      />
      {creatingType && (
        <CreateElementDialog
          type={creatingType}
          onClose={() => setCreatingType(null)}
        />
      )}
    </div>
  );
}
