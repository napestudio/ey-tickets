import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventoWithTicketsType } from "@/types/event";
import SoldTicketsTable from "../sold-tickets-table";
import { getSoldTicketsPaginated } from "@/lib/api/ticket-orders";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Ticket } from "lucide-react";

export default async function SoldTicketsTab({
  evento,
}: {
  evento: EventoWithTicketsType;
}) {
  const { tickets, total } = await getSoldTicketsPaginated(evento.id, {
    page: 1,
    pageSize: 10,
    excludeInvitations: true,
  });

  return (
    <Card className="max-w-[90vw]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vendidas</CardTitle>
          <CardDescription>Listado de entradas vendidas</CardDescription>
        </div>
        <Button
          asChild
          size="sm"
          disabled={evento.status === "CANCELED"}
        >
          <Link
            href={`/dashboard/evento/${evento.id}/vender-entrada`}
            className={cn(
              evento.status === "CANCELED" && "opacity-50 pointer-events-none",
            )}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Vender entrada
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <SoldTicketsTable
          initialTickets={tickets}
          totalCount={total}
          eventId={evento.id}
          eventTitle={evento.title}
          eventAddress={evento.address}
          excludeInvitations={true}
          showInvitationsToggle={false}
        />
      </CardContent>
    </Card>
  );
}
