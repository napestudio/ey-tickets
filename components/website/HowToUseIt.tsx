import Image from "next/image";

import HowItWorksCard from "./HowItWorksCard";
import { ShapeMask } from "./ShapeMask";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";

const HOW_TO_USE_IT_STEPS = [
  {
    title: "Registrate gratis",
    text: "Crea tu cuenta en segundos y de manera sencilla.",
  },
  {
    title: "Vende entradas con tu link",
    text: "Todos los eventos que publiques tienen un link para vender entradas online. Compartilo en tus redes, en tu sitio web o por mail y comenzá a vender.",
  },
  {
    title: "Valida con tu celular",
    text: "El día del evento podes validar las entradas directamente desde tu celular a través de nuestra plataforma de validación. Podés tener tantos validadores como necesites y sin costos adicionales.",
  },
];

export default function HowToUseItSection() {
  return (
    <section className="pt-24 md:pt-32 px-4 lg:px-20 bg-linear-to-b from-black to-ey-turquoise-darker to-80%">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-20 items-center">
          <div className="order-2 md:order-1 relative w-full md:w-2/5">
            <ShapeMask
              orientation="vertical"
              borderColor="#3ADDBE"
              borderWidth={3}
              className="h-full aspect-[3/4]"
            >
              <Image
                src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
                width="1400"
                height="933"
                className="w-full h-full object-cover bg-bottom grayscale opacity-80"
                alt=""
              />
            </ShapeMask>
            <Image
              src="/images/star.svg"
              width={40}
              height={40}
              alt=""
              className="absolute h-19 w-19 -top-5 -right-5"
            />
            <div className="absolute h-15 w-full bottom-0 flex justify-between items-center px-4 pb-6 lg:px-6 overflow-hidden">
              <Image
                src="/images/arrow-down-left.svg"
                width={24}
                height={24}
                alt="Mercado Pago Logo svg"
                className="h-12 w-12 lg:w-15"
              />
              <Image
                src="/images/ey.svg"
                width={24}
                height={24}
                alt=""
                className="h-6 w-auto lg:w-15 pr-2"
              />
            </div>
          </div>
          <div className="order-1 md:order-2 w-full md:w-3/5 flex flex-col">
            <div className="flex flex-col text-white">
              <Title className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-[1.1]">
                ¿Cómo <span className="text-ey-turquoise">se usa?</span>
              </Title>
              <Paragraph
                size="sm"
                className="mt-4 text-white font-semibold lg:text-2xl leading-[1.2] text-pretty"
              >
                Usar EyTickets un super simple. Registrate gratis, vende
                entradas online y valida los tickets desde tu celular el día del
                evento.
              </Paragraph>
            </div>

            <div className="flex items-center mt-8">
              <div>
                {HOW_TO_USE_IT_STEPS.map((step, index) => (
                  <HowItWorksCard
                    key={index}
                    number={index + 1}
                    title={step.title}
                    text={step.text}
                    isLast={index === HOW_TO_USE_IT_STEPS.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
