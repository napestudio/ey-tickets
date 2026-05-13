import EventCard from "@/components/event-card/event-card";
import EventMarquee from "@/components/marquee/marquee";
import { getAllActiveEvents, getAllEvents } from "@/lib/api/eventos";
import { HomeCard } from "@/types/card";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
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
      <h1>Home page eytickets</h1>
    </>
  );
}
