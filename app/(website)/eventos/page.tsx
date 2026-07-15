import EventCard from "@/components/event-card/event-card";
import { getAllActiveEvents } from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import { Title } from "@radix-ui/react-toast";
import { Metadata } from "next/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EyTickets | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function EventosPage() {
  const eventos = await getAllActiveEvents();

  if (!eventos.length) {
    return (
      <section className="mt-10 h-[75vh]">
        <p className="text-xl text-white font-bold">
          No hay eventos disponibles
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-svh py-24 bg-linear-to-t to-black from-ey-turquoise-darker to-80%">
        <div className="container mx-auto">
          <Title className="text-8xl font-bold text-white mb-6">
            Próximos Eventos
          </Title>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos &&
              eventos.map((evento) => (
                <EventCard evento={evento as Evento} key={evento.id} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
