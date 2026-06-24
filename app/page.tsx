import { Metadata } from "next/types";

import Hero from "@/components/website/Hero";
import HowItWorksSection from "@/components/website/HowItWorksSection";
import HowToUseItSection from "@/components/website/HowToUseIt";
import PricingSection from "@/components/website/PricingSection";
import SalesSection from "@/components/website/SalesSection";
import SmoothScrollProvider from "@/lib/smoothScrollProvider";

export const metadata: Metadata = {
  title: "EyTickets | Gestión de eventos y entradas online",
  description: "Venta de tickets online para eventos en vivo.",
};

export default async function Home() {
  return (
    <>
      <SmoothScrollProvider>
        <Hero />
        <HowItWorksSection />
        <PricingSection />
        <SalesSection />
        <HowToUseItSection />
      </SmoothScrollProvider>
    </>
  );
}
