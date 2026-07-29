import EventCard from "@/components/event-card/event-card";
import EventsMarquee from "@/components/website/events/EventsMarquee";
import FeaturedCarousel from "@/components/website/events/FeaturedCarousel";
import CrossIcon from "@/components/website/ui/icons/CrossIcon";
import TktIcon from "@/components/website/ui/icons/TktIcon";
import RedHotIcon from "@/components/website/ui/icons/RedHotIcon";
import { getAllActiveEvents } from "@/lib/api/eventos";
import { getActiveFeaturedEvents } from "@/lib/actions";
import { Evento } from "@/types/event";
import { Title } from "@radix-ui/react-toast";
import { Metadata } from "next/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "EyTickets | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function EventosPage() {
  const [eventos, featuredEvents] = await Promise.all([
    getAllActiveEvents(),
    getActiveFeaturedEvents(),
  ]);

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
      <EventsMarquee events={eventos as Evento[]} />
      <section className="min-h-svh py-24 bg-linear-to-t to-black from-ey-turquoise-darker to-80%">
        <div className="container mx-auto">
          {featuredEvents.length > 0 && (
            <FeaturedCarousel events={featuredEvents} />
          )}
          <div className="flex items-center gap-6">
            <Title className="flex items-center gap-4 text-3xl md:text-6xl font-bold text-white mb-6">
              Próximos Eventos
            </Title>
            <div className="hidden md:flex gap-4">
              <CrossIcon className="text-ey-turquoise w-13 h-10" />
              <TktIcon className="text-[#FF5E3C] w-22 h-10" />
              <RedHotIcon className="text-[#8D84FF] w-12 h-10" />
            </div>
          </div>
          <div className="grid gap-6">
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
