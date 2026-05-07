import { Calendar, DollarSign, LucideIcon } from "lucide-react";
import Box from "./box";

interface StatsCardsProps {
  title: string;
  content: string;
  secondary: string;
  icon: LucideIcon;
}

export default function StatsCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Box>
        <div className="flex flex-row justify-between pb-3">
          <div className="text-sm font-medium">Entradas vendidas</div>
          <DollarSign className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold">$120000</h2>
        <p className="text-sm text-muted-foreground">+20% en el último mes</p>
      </Box>
      <Box>
        <div className="flex flex-row justify-between pb-3">
          <div className="text-sm font-medium">Eventos Activos</div>
          <Calendar className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold">12</h2>
        <p className="text-sm text-muted-foreground">+4% en el último mes</p>
      </Box>
      <Box>
        <div className="flex flex-row justify-between pb-3">
          <div className="text-sm font-medium">Entradas vendidas</div>
          <DollarSign className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold">$120000</h2>
        <p className="text-sm text-muted-foreground">+20% en el último mes</p>
      </Box>
    </div>
  );
}
