import Image from "next/image";

import HowItWorksCard from "./HowItWorksCard";
import { ShapeMask } from "./ShapeMask";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Creás tu cuenta",
    text: "Creás tu cuenta en segundos y de manera sencilla.",
  },
  {
    title: "Comprás los tickets",
    text: "Comprás los tickets que necesitas, los asignas a tus eventos y no tienen fecha de vencimiento.",
  },
  {
    title: "Creás tu evento",
    text: "Publicá tu evento y comenzá a vender. Los tickets que no se vendan los pódes usar para otro evento.",
  },
];

const HOW_IT_WORKS_DESCRIPTION = {
  title: "Cómo funciona?",
  text: "Pagás un costo fijo por ticket. Sin costos ocultos, sin comisiones por venta.",
};

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="min-h-screen p-10 lg:px-20 bg-linear-to-t to-black from-ey-turquoise-darker to-80%"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-20 items-center ">
          <div className="w-full md:w-3/5 flex flex-col">
            <div className="flex flex-col text-white mb-5">
              <Title className="font-bold uppercase text-[clamp(2.5rem,8vw,4.5rem)] leading-[1]">
                Cómo
                <br /> <span className="text-ey-turquoise">funciona?</span>
              </Title>
              <Paragraph className="mt-4 text-white lg:text-xl">
                Pagás un costo fijo por ticket. Sin costos ocultos, sin
                comisiones por venta.
              </Paragraph>
            </div>
            <div className="relative py-8 lg:px-4 flex flex-col items-start">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <HowItWorksCard
                  key={index}
                  number={index + 1}
                  title={step.title}
                  text={step.text}
                  isLast={index === HOW_IT_WORKS_STEPS.length - 1}
                />
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-2/5">
            <ShapeMask
              orientation="vertical"
              borderColor="#3ADDBE"
              borderWidth={3}
              className="h-full aspect-[10/11]"
            >
              <Image
                src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
                width="933"
                height="1440"
                className="w-full h-full object-cover object-bottom grayscale opacity-80"
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
            <div className="absolute h-15 w-full bottom-0 flex justify-between items-center p-4 lg:p-10">
              <Paragraph className="text-white text-sm">
                HACÉ QUE PASE
              </Paragraph>
              <Image
                src="/images/ey.svg"
                width={30}
                height={30}
                alt=""
                className="h-12 w-12 lg:h-15 lg:w-15"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
