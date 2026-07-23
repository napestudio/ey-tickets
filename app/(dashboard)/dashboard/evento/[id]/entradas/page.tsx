import Link from "next/link";

import TicketsTab from "@/components/dashboard/event-details/tickets-tab";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/actions";
import { Evento } from "@/types/event";
import { ArrowLeft } from "lucide-react";

export default async function EntradasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventById(id);

  if (!evento) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={evento.title}
        subtitle="Tipos de entradas y stock"
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <TicketsTab evento={evento as unknown as Evento} />
    </div>
  );
}
