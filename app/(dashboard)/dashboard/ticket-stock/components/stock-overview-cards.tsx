import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary } from "@/types/ticket-stock";
import { Package, Calendar, Users, Ticket } from "lucide-react";

interface StockOverviewCardsProps {
  summary: StockSummary;
}

export default function StockOverviewCards({
  summary,
}: StockOverviewCardsProps) {
  const cards = [
    {
      title: "Disponibles",
      value: summary.unallocated,
      description: "Sin asignar",
      icon: Ticket,
      highlight: summary.unallocated <= 0,
    },
    {
      title: "Asignados",
      value: summary.allocatedToEvents,
      description: "En uso en eventos activos",
      icon: Calendar,
    },
    // {
    //   title: "Asignado a miembros",
    //   value: summary.allocatedToMembers,
    //   description: "Cupos de miembros",
    //   icon: Users,
    // },

    {
      title: "Total en pool",
      value: summary.totalPool,
      description: "Tickets adquiridos",
      icon: Package,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`${card.highlight ? "border-destructive" : "first:bg-ey-turquoise nth-[2]:bg-amber-300 last:bg-neutral-900 last:text-white"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${card.highlight ? "text-destructive" : ""}`}
            >
              {card.value.toLocaleString("es-AR")}
            </div>
            <p className="text-xs mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
