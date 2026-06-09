import { getEventById } from "@/lib/actions";

import EventDetails from "@/components/dashboard/event-details";
import { Evento } from "@/types/event";

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const evento = await getEventById(id);

  if (!evento) return null;
  return (
    <>
      <EventDetails evento={evento as unknown as Evento} tab={tab} />
    </>
  );
}
