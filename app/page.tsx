import FeaturesSection from "@/components/website/features/FeaturesSection";
import Hero from "@/components/website/features/Hero";
import PricingSection from "@/components/website/features/PricingSection";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Gestión de eventos y entradas online",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <PricingSection />
    </>
  );
}
