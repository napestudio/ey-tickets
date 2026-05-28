import {Title} from "./ui/Title";
import ProductCard from "./ProductCard";

const products = [
  {
    title: "Plan Básico",
    description: "Ideal para equipos pequeños que recién arrancan.",
    href: "/planes/basico",
  },
  {
    title: "Plan Pro",
    description: "Todo lo del básico más integraciones avanzadas.",
    href: "/planes/pro",
  },
];

export default function PricingSection() {
  return (
    <section className="min-h-screen py-24 bg-ey-dark">
      <div className="container mx-auto">
        <Title>PRECIOS</Title>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
