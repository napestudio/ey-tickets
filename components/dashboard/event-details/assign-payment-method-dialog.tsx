"use client";

import { useState } from "react";
import { Plus, Landmark, Loader2 } from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { assignPaymentMethodsToEvent } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

function renderTypeBadge(type: string) {
  const statusMap: Record<string, { label: string; color: string }> = {
    CASH: { label: "Punto de venta", color: "bg-green text-white" },
    DIGITAL: { label: "MercadoPago", color: "bg-blue text-white" },
    TRANSFER: { label: "Transferencia", color: "bg-amber-500 text-white" },
  };
  const { label, color } = statusMap[type] ?? { label: type, color: "" };
  return (
    <Badge className={cn(color, "whitespace-nowrap")} variant="secondary">
      {label}
    </Badge>
  );
}

function MethodIcon({ type }: { type: string }) {
  if (type === "DIGITAL") {
    return (
      <div className="h-10 w-10 flex text-white items-center justify-center bg-blue rounded-md overflow-hidden shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
          <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 13 6 6" />
        </svg>
      </div>
    );
  }
  if (type === "CASH") {
    return (
      <div className="h-10 w-10 flex items-center justify-center bg-green text-white rounded-md overflow-hidden shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 18V6" />
        </svg>
      </div>
    );
  }
  if (type === "TRANSFER") {
    return (
      <div className="h-10 w-10 flex items-center justify-center bg-amber-500 text-white rounded-md overflow-hidden shrink-0">
        <Landmark className="h-6 w-6" />
      </div>
    );
  }
  return null;
}

export default function AssignPaymentMethodDialog({
  methods,
  eventId,
  assignedIds,
}: {
  methods: PaymentMethod[];
  eventId: string;
  assignedIds: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAssign = async (method: PaymentMethod) => {
    if (loadingId) return;
    setLoadingId(method.id);
    try {
      const result = await assignPaymentMethodsToEvent({
        eventId,
        paymentMethodIds: [method.id],
      });
      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Error asignando método",
          description: String(result.error),
        });
        return;
      }
      toast({ title: "Método asignado correctamente" });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: (error as Error).message || "No se pudo asignar",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar método de pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar método de pago</DialogTitle>
        </DialogHeader>
        {methods.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No hay métodos de pago disponibles para asignar.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método de pago</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => {
                  const isAssigned = assignedIds.has(method.id);
                  const isLoading = loadingId === method.id;
                  return (
                    <TableRow
                      key={method.id}
                      className={cn(
                        !isAssigned && "cursor-pointer",
                        (isAssigned || isLoading) && "opacity-50"
                      )}
                      onClick={() => !isAssigned && handleAssign(method)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <MethodIcon type={method.type} />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            {method.apiKey && (
                              <div className="text-sm text-muted-foreground truncate max-w-37.5">
                                {method.apiKey}
                              </div>
                            )}
                          </div>
                          {isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderTypeBadge(method.type)}
                          {isAssigned && (
                            <Badge variant="outline">Asignado</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
