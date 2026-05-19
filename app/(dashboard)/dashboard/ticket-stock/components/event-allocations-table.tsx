"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { removeEventAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import AssignEventDialog from "./assign-event-dialog";

interface EventOption {
  id: string;
  title: string;
}

interface AllocationWithEvent {
  id: string;
  eventId: string;
  quantity: number;
  event: {
    id: string;
    title: string;
    status: string;
    endDate: Date | null;
  };
}

interface EventAllocationsTableProps {
  allocations: AllocationWithEvent[];
  events: EventOption[];
  producerId: string;
  availableStock: number;
}

export default function EventAllocationsTable({
  allocations,
  events,
  producerId,
  availableStock,
}: EventAllocationsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AllocationWithEvent | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleEdit(allocation: AllocationWithEvent) {
    setEditTarget(allocation);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function handleDelete(eventId: string, eventTitle: string) {
    startTransition(async () => {
      try {
        await removeEventAllocationAction(eventId);
        toast({
          title: "Asignación eliminada",
          description: `Se quitó el tope de tickets de "${eventTitle}".`,
        });
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la asignación.",
        });
      }
    });
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
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Tickets asignados
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc) => (
                    <tr key={alloc.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{alloc.event.title}</td>
                      <td className="py-3">
                        <Badge variant="secondary" className="text-xs">
                          {alloc.event.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {alloc.quantity.toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleEdit(alloc)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(alloc.eventId, alloc.event.title)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AssignEventDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditTarget(null);
        }}
        producerId={producerId}
        availableStock={availableStock}
        events={editTarget ? events : unassignedEvents}
        existingAllocation={
          editTarget
            ? { eventId: editTarget.eventId, quantity: editTarget.quantity }
            : undefined
        }
      />
    </>
  );
}
