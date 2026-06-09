import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface EventStockDetails {
  quantity: number;
  assignedToTypes: number;
  available: number;
  sold: number;
}

interface EventStockCardProps {
  eventStock: EventStockDetails;
}

export default function EventStockCard({ eventStock }: EventStockCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock de tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Total asignado:{" "}
          <span className="font-medium text-foreground">
            {eventStock.quantity} tickets
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Asignados:{" "}
          <span className="font-medium text-foreground">
            {eventStock.assignedToTypes} tickets
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Disponibles para asignar:{" "}
          <span className="font-medium text-foreground">
            {eventStock.available} tickets
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Vendidos:{" "}
          <span className="font-medium text-foreground">
            {eventStock.sold} tickets
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
