import { Title } from "./ui/Title";
import ProductCard from "./ProductCard";
import { PACKAGE_CATALOG } from "@/lib/ticket-stock-catalog";
import PricePackageCard from "./PackageCard";
import { Paragraph } from "./ui/Paragraph";
export default function PricingSection() {
  return (
    <section className="py-24 bg-linear-to-b to-ey-dark from-ey-turquoise-darker ">
      <div className="container mx-auto">
        <Title className="font-base-neue font-bold text-white mb-4">
          PRECIOS
        </Title>
        <Paragraph className="text-white mb-12">
          Pagás un costo fijo por ticket. Sin costos ocultos, sin comisiones por
          venta, sin fecha de vencimiento.
        </Paragraph>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end pt-4">
          {PACKAGE_CATALOG.map((p, index) => (
            <PricePackageCard key={p.title} {...p} featured={index == 1} />
          ))}
        </div>
        <Paragraph className="text-white mt-12">
          Podés comprar otras contidades y el precio se ajusta automaticamente.
        </Paragraph>
      </div>
    </section>
  );
}
