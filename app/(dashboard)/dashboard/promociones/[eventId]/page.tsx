import { getEventById } from "@/lib/actions";
import { Evento } from "@/types/event";

export default async function Promotions({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const evento = await getEventById(eventId);
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Promociones
      </h1>
      <p>{eventId}</p>
    </>
  );
}
