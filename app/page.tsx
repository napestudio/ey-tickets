import FeaturesSection from "@/components/website/FeaturesSection";
import Hero from "@/components/website/Hero";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Gestión de eventos y entradas online",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
  return (
    <>
      <div className="bg-neutral-900">
        <Hero />
        <FeaturesSection />
      </div>
    </>
  );
}
