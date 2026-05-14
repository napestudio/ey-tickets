import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary } from "@/types/ticket-stock";
import { Package, Calendar, Users, Ticket } from "lucide-react";

interface StockOverviewCardsProps {
  summary: StockSummary;
}

export default function StockOverviewCards({ summary }: StockOverviewCardsProps) {
  const cards = [
    {
      title: "Total en pool",
      value: summary.totalPool,
      description: "Tickets adquiridos",
      icon: Package,
    },
    {
      title: "Asignado a eventos",
      value: summary.allocatedToEvents,
      description: "En uso por eventos activos",
      icon: Calendar,
    },
    {
      title: "Asignado a miembros",
      value: summary.allocatedToMembers,
      description: "Cupos de miembros",
      icon: Users,
    },
    {
      title: "Disponible",
      value: summary.unallocated,
      description: "Sin asignar",
      icon: Ticket,
      highlight: summary.unallocated <= 0,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.highlight ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${card.highlight ? "text-destructive" : ""}`}
            >
              {card.value.toLocaleString("es-AR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
