import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import EventImagesManager from "@/components/dashboard/event-details/event-images-manager";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";

export default async function ImagenesEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evento, session] = await Promise.all([
    getEventById(id),
    getServerSession(authOptions),
  ]);

  if (!evento || !session) return null;

  const isEventOwner = can(session.user, "events:edit");

  if (!isEventOwner) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader title={evento.title} subtitle="Imágenes del evento" />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <EventImagesManager
        eventId={evento.id}
        eventTitle={evento.title}
        eventImage={evento.image ?? null}
        eventImagePublicId={evento.imagePublicId ?? null}
        thumbnailImage={evento.thumbnailImage ?? null}
        thumbnailImagePublicId={evento.thumbnailImagePublicId ?? null}
      />
    </div>
  );
}
