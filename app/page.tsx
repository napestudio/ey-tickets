import Faqs from "@/components/website/Faqs";
import Hero from "@/components/website/Hero";
import HowItWorksSection from "@/components/website/HowItWorksSection";
import HowToUseItSection from "@/components/website/HowToUseIt";
import PricingSection from "@/components/website/PricingSection";
import SalesSection from "@/components/website/SalesSection";
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
      <SalesSection />
      <HowToUseItSection />
    </>
  );
}
