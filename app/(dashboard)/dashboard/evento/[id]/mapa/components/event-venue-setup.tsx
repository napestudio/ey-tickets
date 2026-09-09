"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EventVenue, Venue, VenueSector } from "@/types/venue";
import {
  assignVenueToEventAction,
  updateEventSectorMappingsAction,
  generateSeatsAction,
  regenerateSeatsAction,
  removeVenueFromEventAction,
} from "@/lib/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectorMappingForm } from "./sector-mapping-form";
import { EventSeatMapPreview } from "./event-seat-map-preview";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, MapPin, Unlink } from "lucide-react";
import Link from "next/link";

interface TicketTypeOption {
  id: string;
  title: string;
  price: number | string;
}

interface EventVenueSetupProps {
  eventId: string;
  eventVenue: (EventVenue & { seats?: { id: string }[] }) | null;
  venues: (Venue & { _count?: { elements: number; sectors: number } })[];
  ticketTypes: TicketTypeOption[];
}

export function EventVenueSetup({
  eventId,
  eventVenue,
  venues,
  ticketTypes,
}: EventVenueSetupProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ─── State 1: No venue assigned ───────────────────────────────────────────
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");

  // ─── State 2: Mappings ────────────────────────────────────────────────────
  const initialMappings: Record<string, string> = {};
  if (eventVenue?.mappings) {
    for (const m of eventVenue.mappings) {
      initialMappings[m.venueSectorId] = m.ticketTypeId;
    }
  }
  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings);

  // ─── Actions ──────────────────────────────────────────────────────────────

  function handleAssign() {
    if (!selectedVenueId) return;
    startTransition(async () => {
      try {
        await assignVenueToEventAction(eventId, selectedVenueId);
        toast({ title: "Venue asignado correctamente." });
        router.refresh();
      } catch (e) {
        toast({
          title: "Error al asignar venue",
          description: e instanceof Error ? e.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  function handleSaveMappings() {
    if (!eventVenue) return;
    startTransition(async () => {
      try {
        const pairs = Object.entries(mappings)
          .filter(([, tid]) => tid)
          .map(([venueSectorId, ticketTypeId]) => ({
            venueSectorId,
            ticketTypeId,
          }));
        await updateEventSectorMappingsAction(eventVenue.id, eventId, pairs);
        toast({ title: "Mapeo de sectores guardado." });
        router.refresh();
      } catch (e) {
        toast({
          title: "Error al guardar mapeo",
          description: e instanceof Error ? e.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  function handleGenerateSeats() {
    if (!eventVenue) return;
    startTransition(async () => {
      try {
        const result = await generateSeatsAction(eventVenue.id, eventId);
        toast({
          title: `${result.created} asientos generados correctamente.`,
        });
        router.refresh();
      } catch (e) {
        toast({
          title: "Error al generar asientos",
          description: e instanceof Error ? e.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  function handleRegenerateSeats() {
    if (!eventVenue) return;
    startTransition(async () => {
      try {
        const result = await regenerateSeatsAction(eventVenue.id, eventId);
        toast({ title: `${result.created} asientos regenerados.` });
        router.refresh();
      } catch (e) {
        toast({
          title: "Error al regenerar asientos",
          description: e instanceof Error ? e.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  function handleRemoveVenue() {
    if (!eventVenue) return;
    startTransition(async () => {
      try {
        await removeVenueFromEventAction(eventVenue.id, eventId);
        toast({ title: "Venue desvinculado del evento." });
        router.refresh();
      } catch (e) {
        toast({
          title: "Error al desvincular venue",
          description: e instanceof Error ? e.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  // ─── Derived data ─────────────────────────────────────────────────────────

  const sectors: VenueSector[] = eventVenue?.venue?.sectors ?? [];

  const allMapped =
    sectors.length > 0 && sectors.every((s) => s.id && mappings[s.id]);

  const hasSeats = (eventVenue?.seats?.length ?? 0) > 0;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  // State 1: No venue assigned
  if (!eventVenue) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="border rounded-lg p-5 space-y-4 bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Asignar sala al evento</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Seleccioná una sala existente de tu productora para habilitar la
            venta de entradas numeradas.
          </p>

          <div className="space-y-2">
            <Label>Sala</Label>
            {venues.length === 0 ? (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>No tenés salas creadas.</p>
                <Link href="/dashboard/venues/new">
                  <Button variant="outline" size="sm">
                    Crear sala
                  </Button>
                </Link>
              </div>
            ) : (
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná una sala..." />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                      {v._count && (
                        <span className="text-muted-foreground text-xs ml-1">
                          ({v._count.sectors} sectores)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Button
            onClick={handleAssign}
            disabled={!selectedVenueId || isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Asignar sala
          </Button>
        </div>
      </div>
    );
  }

  // State 2 & 3: Venue assigned
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Venue info header */}
      <div className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {eventVenue.venue?.name ?? "Sala asignada"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/venues/${eventVenue.venueId}/edit`}>
            <Button variant="ghost" size="sm" className="text-xs">
              Editar sala
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Unlink className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Desvincular la sala?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán todos los asientos generados y los mapeos de
                  sectores. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveVenue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Desvincular
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Map preview */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Vista previa del mapa</h3>
        <EventSeatMapPreview eventVenue={eventVenue} />
      </div>

      {/* Sector mappings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Mapeo de sectores → tipos de entrada</h3>
        </div>
        <SectorMappingForm
          sectors={sectors}
          ticketTypes={ticketTypes}
          mappings={mappings}
          onChange={(venueSectorId, ticketTypeId) =>
            setMappings((prev) => ({ ...prev, [venueSectorId]: ticketTypeId }))
          }
        />
        <Button
          onClick={handleSaveMappings}
          disabled={isPending || sectors.length === 0}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar mapeo
        </Button>
      </div>

      {/* Generate seats */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="text-sm font-medium">Generación de asientos</h3>
        <p className="text-xs text-muted-foreground">
          Una vez guardado el mapeo, generá los asientos individuales. El stock
          de cada tipo de entrada se actualizará automáticamente.
        </p>
        {hasSeats ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending || !allMapped}>
                Regenerar asientos
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Regenerar los asientos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán todos los asientos no vendidos y se recrearán
                  desde el mapa actual. Los asientos con entradas vendidas no
                  pueden eliminarse.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerateSeats}>
                  Regenerar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={handleGenerateSeats}
            disabled={isPending || !allMapped}
            size="sm"
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Generar asientos
          </Button>
        )}
        {!allMapped && sectors.length > 0 && (
          <p className="text-xs text-amber-500">
            Guardá el mapeo de todos los sectores antes de generar asientos.
          </p>
        )}
      </div>
    </div>
  );
}
