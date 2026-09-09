import { notFound, redirect } from "next/navigation";
import { getSingleEventBySlug } from "@/lib/api/eventos";
import { getEventVenue } from "@/lib/api/venues";
import { getSeatsByEventVenueGrouped } from "@/lib/api/seats";
import { releaseExpiredHolds } from "@/lib/api/seats";
import { SeatMapPageClient } from "./components/seat-map-page-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventSeatMapPage({ params }: Props) {
  const { slug } = await params;

  const event = await getSingleEventBySlug(slug);
  if (!event) notFound();

  const eventVenue = await getEventVenue(event.id);
  if (!eventVenue) redirect(`/eventos/${slug}`);

  // Clean up expired holds before rendering
  await releaseExpiredHolds();

  const sectors = await getSeatsByEventVenueGrouped(eventVenue.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Back link */}
        <Link
          href={`/eventos/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al evento
        </Link>

        <div>
          <h1 className="text-xl font-bold">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seleccioná tu asiento
          </p>
        </div>

        <SeatMapPageClient
          sectors={JSON.parse(JSON.stringify(sectors))}
          eventSlug={slug}
        />
      </div>
    </div>
  );
}
