import { getEventById } from "@/lib/actions";

import EventDetails from "@/components/dashboard/event-details";
import { Evento } from "@/types/event";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evento = await getEventById(id);

  if (!evento) return null;
  return (
    <>
      <EventDetails evento={evento as unknown as Evento} />
    </>
  );
}
