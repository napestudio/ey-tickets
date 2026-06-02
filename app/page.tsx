import Hero from "@/components/website/Hero";
import HowItWorksSection from "@/components/website/HotItWorksSection";
import PricingSection from "@/components/website/PricingSection";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Gestión de eventos y entradas online",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <PricingSection />
    </>
  );
}
