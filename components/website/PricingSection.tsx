import { Title } from "./ui/Title";
import { PACKAGE_CATALOG } from "@/lib/ticket-stock-catalog";
import PricePackageCard from "./PackageCard";
import { Paragraph } from "./ui/Paragraph";
import { ShapeMask } from "./ShapeMask";

export default function PricingSection() {
  return (
    <section className="relative min-h-screen py-12 px-4 bg-linear-to-b from-ey-turquoise-darker to-ey-dark">
      <div className="absolute inset-0 bg-[url('/images/tkt-sm-pattern.png')] bg-repeat bg-top bg-cover opacity-50 z-0" />
      <div className="relative container mx-auto">
        <Title className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-[1] text-white text-center pb-10">
          <span className="text-ey-turquoise">Planes<br/></span> a tu medida
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10 items-end pt-4">
          {/* Card 0 - izquierda */}

          <PricePackageCard
            key={PACKAGE_CATALOG[0].title}
            {...PACKAGE_CATALOG[0]}
            featured={0}
          />

          {/* Card 1 - centro: levantada con texto abajo */}
          <div className="flex flex-col items-center gap-2 lg:gap-0 sm:col-start-2">
            <div className="w-full">
              <PricePackageCard
                key={PACKAGE_CATALOG[1].title}
                {...PACKAGE_CATALOG[1]}
                featured={1}
              />
            </div>
            <Paragraph
              size="md"
              className="text-white text-center text-balance mt-4 hidden lg:block"
            >
              También podés comprar otras cantidades y el precio se ajusta
              automáticamente.
            </Paragraph>
          </div>

          {/* Card 2 - derecha */}

          <PricePackageCard
            key={PACKAGE_CATALOG[2].title}
            {...PACKAGE_CATALOG[2]}
            featured={2}
          />
          <Paragraph
              size="md"
              className="text-white text-center text-balance mt-4 block lg:hidden"
            >
              También podés comprar otras cantidades y el precio se ajusta
              automáticamente.
            </Paragraph>
        </div>
      </div>
      
    </section>
  );
}
