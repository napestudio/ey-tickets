import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import InvitadosTab from "@/components/dashboard/event-details/invitados-tab";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById, getSoldTicketCountsByTypeAction } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { EventoWithTicketsType } from "@/types/event";
import { ArrowLeft } from "lucide-react";

export default async function InvitadosPage({
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
  const soldTickets = await getSoldTicketCountsByTypeAction(id);

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={evento.title}
        subtitle="Invitaciones al evento"
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <InvitadosTab
        evento={evento as unknown as EventoWithTicketsType}
        isEventOwner={isEventOwner}
        soldTickets={soldTickets}
      />
    </div>
  );
}
