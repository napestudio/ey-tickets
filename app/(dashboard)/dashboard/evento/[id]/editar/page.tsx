import Link from "next/link";

import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { Evento } from "@/types/event";
import { ArrowLeft } from "lucide-react";
import { EditEventWizard } from "@/app/(dashboard)/dashboard/components/edit-event-wizard/edit-event-wizard";
import { getProducerById } from "@/lib/api/producers";

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evento, session] = await Promise.all([
    getEventById(id),
    getSession(),
  ]);

  if (!evento || !session) return null;

  if (!can(session.user, "events:edit")) return null;

  const producerId = (evento as unknown as Evento).producerId;
  const producer = producerId ? await getProducerById(producerId) : null;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={evento.title}
        subtitle="Editá los datos del evento"
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <EditEventWizard
        evento={evento as unknown as Evento}
        producerState={producer?.state ?? undefined}
        producerCity={producer?.city ?? undefined}
      />
    </div>
  );
}
