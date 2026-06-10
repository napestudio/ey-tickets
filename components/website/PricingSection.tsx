import { Title } from "./ui/Title";
import ProductCard from "./ProductCard";
import { PACKAGE_CATALOG } from "@/lib/ticket-stock-catalog";
import PricePackageCard from "./PackageCard";
import { Paragraph } from "./ui/Paragraph";
export default function PricingSection() {
  return (
    <section className="p-24 bg-linear-to-b to-ey-dark from-ey-turquoise-darker ">
      <div className="container mx-auto">
        <Title className="font-bold uppercase text-7xl text-white text-center pb-20">
          <span className="text-ey-turquoise">Planes</span> a tu medida
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 items-end pt-4">
          {PACKAGE_CATALOG.map((p, index) => (
            <PricePackageCard key={p.title} {...p} featured={index} />
          ))}
          <Paragraph className="text-white font-thin mt-12 col-start-2 text-center">
            Podés comprar otras cantidades y el precio se ajusta
            automáticamente.
          </Paragraph>
        </div>
      </div>
    </section>
  );
}
