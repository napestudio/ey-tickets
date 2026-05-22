import EventCard from "@/components/event-card/event-card";
import { getAllActiveEvents } from "@/lib/api/eventos";
import { Metadata } from "next/types";

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
      <section className="container pb-14">
        <h1 className="mb-14 mt-10 scroll-m-20 text-4xl tracking-tight lg:text-7xl text-white text-stroke">
          <span className="font-extrabold">PRÓXIMOS</span>{" "}
          <span className="font-thin">EVENTOS</span>
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {eventos &&
            eventos.map((evento) => (
              <EventCard
                evento={{ ...evento, location: evento.city }}
                key={evento.id}
              />
            ))}
        </div>
      </section>
    </>
  );
}
