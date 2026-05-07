import { getEventById } from "@/lib/actions";

import EventDetails from "@/components/dashboard/event-details";
import { Evento } from "@/types/event";

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const evento = await getEventById(params.id);

  if (!evento) return null;
  return (
    <>
      <EventDetails evento={evento as Evento} />
    </>
  );
}
