import { getEventById } from "@/lib/actions";
import EventOverview from "@/components/dashboard/event-overview";
import { EventoWithTicketsType } from "@/types/event";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventById(id);

  if (!evento) return null;
  return <EventOverview evento={evento as unknown as EventoWithTicketsType} />;
}
