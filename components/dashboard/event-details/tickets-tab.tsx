import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Evento } from "@/types/event";
import InfoTicketTypeCard from "../info-ticket-type-card";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function TicketsTab({ evento }: { evento: Evento }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tipos de tickets</CardTitle>
          <CardDescription>Administra tus tickets y precios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {evento.ticketTypes &&
            evento.ticketTypes.map((ticket, index) => (
              <InfoTicketTypeCard key={index} ticket={ticket} />
            ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <Link
              href={`/dashboard/evento/${evento.id}/edit?tab=tickets`}
              className="flex items-center"
            >
              <Ticket className="mr-2 h-4 w-4" />
              Agregar tipo de ticket
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
