import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TicketStockMovement } from "@/types/ticket-stock";

interface StockMovementLogProps {
  movements: TicketStockMovement[];
}

export default function StockMovementLog({ movements }: StockMovementLogProps) {
  if (movements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Sin movimientos registrados aún.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Delta</TableHead>
          <TableHead className="text-right">Anterior</TableHead>
          <TableHead className="text-right">Nuevo</TableHead>
          <TableHead>Motivo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="text-sm whitespace-nowrap">
              {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", {
                locale: es,
              })}
            </TableCell>
            <TableCell className="text-sm">
              {movement.performedBy?.name ?? "—"}
            </TableCell>
            <TableCell>
              {movement.type === "INCREASE" ? (
                <Badge variant="default" className="bg-green-600 text-white">
                  Ingreso
                </Badge>
              ) : (
                <Badge variant="destructive">Egreso</Badge>
              )}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {movement.delta > 0 ? `+${movement.delta}` : movement.delta}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {movement.previousQuantity}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {movement.newQuantity}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {movement.reason ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
