"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/use-toast";
import { confirmTransferOrderAction, cancelTransferOrderAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";

export type PendingTransferOrder = {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  quantity: number;
  totalPrice: number | null;
  createdAt: Date | string;
  ticketType: { title: string } | null;
};

export default function TransferOrdersTable({
  eventId,
  orders,
}: {
  eventId: string;
  orders: PendingTransferOrder[];
}) {
  const [isPending, startTransition] = useTransition();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  function handleConfirm(orderId: string) {
    setActiveOrderId(orderId);
    startTransition(async () => {
      try {
        await confirmTransferOrderAction(orderId, eventId);
        toast({ title: "Pago confirmado y entradas emitidas" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al confirmar el pago",
        });
      } finally {
        setActiveOrderId(null);
      }
    });
  }

  function handleCancel(orderId: string) {
    setActiveOrderId(orderId);
    startTransition(async () => {
      try {
        await cancelTransferOrderAction(orderId, eventId);
        toast({ title: "Orden cancelada" });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cancelar la orden",
        });
      } finally {
        setActiveOrderId(null);
      }
    });
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay órdenes pendientes de transferencia.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Comprador</TableHead>
          <TableHead>Tipo de entrada</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isRowPending = isPending && activeOrderId === order.id;
          return (
            <TableRow key={order.id}>
              <TableCell>
                <div className="font-medium">
                  {order.name} {order.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{order.email}</div>
              </TableCell>
              <TableCell>{order.ticketType?.title ?? "-"}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>
                ${Number(order.totalPrice ?? 0).toLocaleString("es-AR")}
              </TableCell>
              <TableCell>
                {new Date(order.createdAt).toLocaleDateString("es-AR")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleConfirm(order.id)}
                >
                  {isRowPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirmar pago y emitir entradas"
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isPending}>
                      Cancelar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Cancelar esta orden?</AlertDialogTitle>
                      <AlertDialogDescription>
                        El comprador quedará sin entradas. Esta acción no se
                        puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Volver</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancel(order.id)}>
                        Cancelar orden
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
