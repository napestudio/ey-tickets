import NewTokenDialog from "@/app/dashboard/components/new-token-dialog/new-token-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento, EventoWithTicketsType } from "@/types/event";
import { ValidatorToken } from "@/types/validators";
import SoldTicketsTable from "../sold-tickets-table";
import { TicketOrderType } from "@/types/tickets";

export default function SoldTicketsTab({
  evento,
}: {
  evento: EventoWithTicketsType;
}) {
  return (
    <Card className="max-w-[90vw]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Entradas vendidas</CardTitle>
          <CardDescription>
            Listado de entradas vendidas para este evento
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {evento.validatorToken && evento.tickets?.length && (
          <SoldTicketsTable
            tickets={evento.tickets as TicketOrderType[]}
            evento={evento}
          />
        )}
      </CardContent>
    </Card>
  );
}
