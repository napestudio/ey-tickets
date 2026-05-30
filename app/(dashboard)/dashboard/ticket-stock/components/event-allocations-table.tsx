"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { AllocationWithUsage } from "@/types/ticket-stock";
import AssignEventDialog from "./assign-event-dialog";
import RemoveEventTicketsDialog from "./remove-event-tickets-dialog";

interface EventOption {
  id: string;
  title: string;
}

interface EventAllocationsTableProps {
  allocations: AllocationWithUsage[];
  events: EventOption[];
  producerId: string;
  availableStock: number;
}

const EVENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  DRAFT: "Borrador",
  CONCLUDED: "Concluido",
  CANCELED: "Cancelado",
  DELETED: "Eliminado",
};

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "ACTIVE") return "default";
  if (status === "DRAFT") return "secondary";
  if (status === "CONCLUDED") return "outline";
  return "destructive";
}

export default function EventAllocationsTable({
  allocations,
  events,
  producerId,
  availableStock,
}: EventAllocationsTableProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [activeAllocation, setActiveAllocation] = useState<AllocationWithUsage | null>(null);

  function handleAdd(allocation: AllocationWithUsage) {
    setActiveAllocation(allocation);
    setAddDialogOpen(true);
  }

  function handleRemove(allocation: AllocationWithUsage) {
    setActiveAllocation(allocation);
    setRemoveDialogOpen(true);
  }

  function handleNew() {
    setActiveAllocation(null);
    setAddDialogOpen(true);
  }

  const assignedEventIds = new Set(allocations.map((a) => a.eventId));
  const unassignedEvents = events.filter((e) => !assignedEventIds.has(e.id));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Asignación por evento</CardTitle>
          <Button size="sm" onClick={handleNew} disabled={unassignedEvents.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Asignar
          </Button>
        </CardHeader>
        <CardContent>
          {allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay asignaciones por evento. Los eventos consumirán del pool general.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Evento</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">En uso</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Vendidos</th>
                    <th className="py-2 font-medium text-muted-foreground w-24">Utilización</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc) => {
                    const removable = alloc.quantity - alloc.ticketTypesQuantity;
                    return (
                      <tr key={alloc.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{alloc.event.title}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(alloc.event.status)} className="text-xs">
                            {EVENT_STATUS_LABELS[alloc.event.status] ?? alloc.event.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right font-mono text-sm">
                          {alloc.ticketTypesQuantity.toLocaleString("es-AR")}
                          <span className="text-muted-foreground">
                            {" / "}{alloc.quantity.toLocaleString("es-AR")}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {alloc.ticketsSold.toLocaleString("es-AR")}
                        </td>
                        <td className="py-3 w-24">
                          <Progress
                            value={
                              alloc.quantity > 0
                                ? Math.min(100, (alloc.ticketTypesQuantity / alloc.quantity) * 100)
                                : 0
                            }
                            className="h-2"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              onClick={() => handleAdd(alloc)}
                              disabled={availableStock === 0}
                              title={
                                availableStock === 0 ? "Sin stock disponible en el pool" : "Agregar tickets"
                              }
                            >
                              Agregar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                              onClick={() => handleRemove(alloc)}
                              disabled={removable === 0}
                              title={
                                removable === 0
                                  ? "Todos los tickets están en uso en tipos de ticket"
                                  : "Quitar tickets"
                              }
                            >
                              Quitar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog: agregar tickets a asignación existente o crear nueva */}
      <AssignEventDialog
        open={addDialogOpen}
        onOpenChange={(v) => {
          setAddDialogOpen(v);
          if (!v) setActiveAllocation(null);
        }}
        producerId={producerId}
        availableStock={availableStock}
        events={activeAllocation ? events : unassignedEvents}
        existingAllocation={
          activeAllocation
            ? {
                eventId: activeAllocation.eventId,
                eventTitle: activeAllocation.event.title,
                quantity: activeAllocation.quantity,
                ticketTypesQuantity: activeAllocation.ticketTypesQuantity,
              }
            : undefined
        }
      />

      {/* Dialog: quitar tickets de una asignación */}
      {activeAllocation && (
        <RemoveEventTicketsDialog
          open={removeDialogOpen}
          onOpenChange={(v) => {
            setRemoveDialogOpen(v);
            if (!v) setActiveAllocation(null);
          }}
          producerId={producerId}
          allocation={{
            eventId: activeAllocation.eventId,
            eventTitle: activeAllocation.event.title,
            quantity: activeAllocation.quantity,
            ticketTypesQuantity: activeAllocation.ticketTypesQuantity,
            ticketsSold: activeAllocation.ticketsSold,
          }}
        />
      )}
    </>
  );
}
