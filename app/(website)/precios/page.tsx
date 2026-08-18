import PricingSection from "@/components/website/PricingSection";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Precios | ${SITE_NAME}`,
  description: `${SITE_DESCRIPTION}`,
};

export default function PricingPage() {
  return (
    <div className="pb-32 bg-linear-to-b from-ey-turquoise-darker to-ey-dark">
      <PricingSection />
    </div>
  );
}
