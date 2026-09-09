import { getSession } from "@/lib/auth/get-session";
import { redirect, notFound } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getEventById } from "@/lib/api/eventos";
import { getEventVenue, getVenuesByProducerId } from "@/lib/api/venues";
import { getTicketTypesByEventId } from "@/lib/api/ticket-types";
import { EventVenueSetup } from "./components/event-venue-setup";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventMapPage({ params }: Props) {
  const session = await getSession();
  if (!session?.user?.producerId) redirect("/dashboard");

  const { id: eventId } = await params;

  const [event, eventVenue, venues, ticketTypes] = await Promise.all([
    getEventById(eventId),
    getEventVenue(eventId),
    getVenuesByProducerId(session.user.producerId),
    getTicketTypesByEventId(eventId),
  ]);

  if (!event || event.producerId !== session.user.producerId) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6">
        <Link
          href={`/dashboard/evento/${eventId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al evento
        </Link>
        <DashboardHeader
          title="Mapa de asientos"
          subtitle={event.title}
        />
      </div>

      <div className="px-4 md:px-6">
        <EventVenueSetup
          eventId={eventId}
          eventVenue={eventVenue ? JSON.parse(JSON.stringify(eventVenue)) : null}
          venues={JSON.parse(JSON.stringify(venues))}
          ticketTypes={JSON.parse(JSON.stringify(ticketTypes))}
        />
      </div>
    </div>
  );
}
