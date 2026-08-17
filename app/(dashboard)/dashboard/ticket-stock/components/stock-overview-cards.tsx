import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary } from "@/types/ticket-stock";
import { Calendar, Ticket } from "lucide-react";

interface StockOverviewCardsProps {
  summary: StockSummary;
}

export default function StockOverviewCards({
  summary,
}: StockOverviewCardsProps) {
  const cards = [
    {
      title: "Disponibles",
      value: summary.available,
      description: "Sin usar en tipos de ticket",
      icon: Ticket,
      highlight: summary.available <= 0,
    },
    {
      title: "Recuperables",
      value: summary.usedByTicketTypes - summary.soldTickets,
      description: "Asignados pero no vendidos",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={`${card.highlight ? "border-destructive" : "first:bg-ey-turquoise last:bg-amber-300"}`}
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
