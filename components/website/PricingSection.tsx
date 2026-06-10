import { Title } from "./ui/Title";
import { PACKAGE_CATALOG } from "@/lib/ticket-stock-catalog";
import PricePackageCard from "./PackageCard";
import { Paragraph } from "./ui/Paragraph";

export default function PricingSection() {
  return (
    <section className="py-12 px-4 sm:p-24 bg-linear-to-b to-ey-dark from-ey-turquoise-darker">
      <div className="container mx-auto">
        <Title className="font-bold uppercase text-[clamp(2.5rem,8vw,4.5rem)] text-white text-center pb-10 sm:pb-20">
          <span className="text-ey-turquoise">Planes</span> a tu medida
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10 items-end pt-4">

          {/* Card 0 - izquierda */}
          <PricePackageCard key={PACKAGE_CATALOG[0].title} {...PACKAGE_CATALOG[0]} featured={0} />

          {/* Card 1 - centro: levantada con texto abajo */}
          <div className="flex flex-col items-center gap-10 sm:col-start-2">
            <PricePackageCard key={PACKAGE_CATALOG[1].title} {...PACKAGE_CATALOG[1]} featured={1} />
            <Paragraph size="md" className="text-white font-thin text-center text-balance">
              También podés comprar otras cantidades y el precio se ajusta
              automáticamente.
            </Paragraph>
          </div>

          {/* Card 2 - derecha */}
          <PricePackageCard key={PACKAGE_CATALOG[2].title} {...PACKAGE_CATALOG[2]} featured={2} />

        </div>
      </div>
    </section>
  );
}