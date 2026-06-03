import HowItWorksCard from "./HowItWorksCard";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Creás tu cuenta",
    text: "Creás tu cuenta en segundos.",
  },
  {
    title: "Comprás los tickets",
    text: "Comprás los tickets que necesites, los asignas a tus eventos y no tienen fecha de vencimiento.",
  },
  {
    title: "Creás tu evento",
    text: "Publicá tu evento y comenzá a vender. Los tickets que no se vendan los pódes usar para otro evento.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-linear-to-t to-black from-ey-turquoise-darker to-80%"
    >
      <div className="container mx-auto">
        <div className="flex flex-col text-white ">
          <Title className="font-base-neue font-bold">Cómo funciona?</Title>
          <Paragraph>
            Pagás un costo fijo por ticket. Sin costos ocultos, sin comisiones
            por venta.
          </Paragraph>
        </div>

        <div className="flex">
          <div>
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <HowItWorksCard
                key={index}
                number={index + 1}
                title={step.title}
                text={step.text}
              />
            ))}
          </div>
          <div className="w-150 aspect-square bg-neutral-100"></div>
        </div>
      </div>
    </section>
  );
}
