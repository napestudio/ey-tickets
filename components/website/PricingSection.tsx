import { PACKAGE_CATALOG } from "@/lib/ticket-stock-catalog";
import PricePackageCard from "./PackageCard";
import { Button } from "./ui/Button";
import GiftIcon from "./ui/icons/GiftIcon";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";

export default function PricingSection() {
  return (
    <section className="relative h-full pt-32 px-4 bg-linear-to-b from-ey-turquoise-darker to-ey-dark font-nebulica">
      <div className="absolute inset-0 bg-[url('/images/tkt-sm-pattern.png')] bg-repeat bg-top bg-cover opacity-50 z-0" />
      <div className="relative container mx-auto">
        <Title className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-none text-white text-center pb-10">
          <span className="text-ey-turquoise">
            Planes
            <br />
          </span>{" "}
          a tu medida
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
        <div className="flex md:flex-row flex-col items-center gap-2 bg-linear-to-tl from-ey-turquoise/50 to-ey-dark shadow-[-1px_-1px_0.5px_0px_#3addbe90,1px_1px_0.5px_0px_#3addbe75] rounded-md text-center md:w-max mx-auto py-5 px-7 font-bold mt-10 text-white text-lg lg:text-xl">
          <GiftIcon className="w-5 h-5" />
          <p>
            Registrate y recibí{" "}
            <span className="text-ey-turquoise">30 entradas</span> de regalo de
            bienvenida
          </p>
        </div>
        <div className="w-full py-4">
          <Button
            className="bg-ey-turquoise mx-auto w-max uppercase rounded-2xl text-ey-dark font-medium hover:bg-ey-turquoise-dark transition-colors text-center"
            href="/registro/productora"
          >
            Regitrar productora
          </Button>
        </div>
      </div>
    </section>
  );
}
