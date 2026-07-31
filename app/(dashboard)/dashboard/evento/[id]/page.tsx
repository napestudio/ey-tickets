import { getEventForOverview } from "@/lib/actions";
import EventOverview from "@/components/dashboard/event-overview";
import { Evento } from "@/types/event";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventForOverview(id);

  if (!evento) return null;
  return <EventOverview evento={evento as unknown as Evento} />;
}
