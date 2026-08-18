"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { removeMemberAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import AssignMemberDialog from "./assign-member-dialog";
import { useProducerStockStore } from "@/store/producer-stock-store";

interface MemberOption {
  id: string;
  name: string | null;
  email: string | null;
}

interface AllocationWithUser {
  id: string;
  userId: string;
  quantity: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface MemberAllocationsTableProps {
  allocations: AllocationWithUser[];
  members: MemberOption[];
  producerId: string;
  availableStock: number;
}

export default function MemberAllocationsTable({
  allocations,
  members,
  producerId,
  availableStock,
}: MemberAllocationsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AllocationWithUser | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const refreshStock = useProducerStockStore((s) => s.refresh);

  function handleEdit(allocation: AllocationWithUser) {
    setEditTarget(allocation);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function handleDelete(userId: string, userName: string | null) {
    startTransition(async () => {
      try {
        await removeMemberAllocationAction(userId);
        toast({
          title: "Cupo eliminado",
          description: `Se quitó el cupo de tickets de "${userName ?? userId}".`,
        });
        refreshStock();
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar el cupo.",
        });
      }
    });
  }

  const assignedUserIds = new Set(allocations.map((a) => a.userId));
  const unassignedMembers = members.filter((m) => !assignedUserIds.has(m.id));

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cupos por miembro</CardTitle>
          <Button
            size="sm"
            onClick={handleNew}
            disabled={unassignedMembers.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Asignar
          </Button>
        </CardHeader>
        <CardContent>
          {allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cupos asignados a miembros. Los miembros no tienen límite personal.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Miembro
                    </th>
                    <th className="text-left py-2 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Cupo asignado
                    </th>
                    <th className="text-right py-2 font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((alloc) => (
                    <tr key={alloc.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        {alloc.user.name ?? "-"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {alloc.user.email ?? "-"}
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
                            onClick={() => handleDelete(alloc.userId, alloc.user.name)}
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

      <AssignMemberDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditTarget(null);
        }}
        producerId={producerId}
        availableStock={availableStock}
        members={editTarget ? members : unassignedMembers}
        existingAllocation={
          editTarget
            ? { userId: editTarget.userId, quantity: editTarget.quantity }
            : undefined
        }
      />
    </>
  );
}
