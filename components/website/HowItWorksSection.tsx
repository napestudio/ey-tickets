import HowItWorksCard from "./HowItWorksCard";
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
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="px-4 py-10 lg:p-20 bg-linear-to-t to-black from-ey-turquoise-darker to-80%"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start overflow-hidden">
          <div className="w-full md:w-3/5 flex flex-col">
            <div className="flex flex-col text-white mb-5">
              <Title className="font-bold uppercase text-6xl">
                Cómo <span className="text-ey-turquoise">funciona?</span>
              </Title>
              <Paragraph size="sm" className="mt-4 text-white ">
                Pagás un costo fijo por ticket. Sin costos ocultos, sin
                comisiones por venta.
              </Paragraph>
            </div>
            <div className="relative py-8 px-4 flex flex-col items-start">
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
          <div className="w-full md:w-2/5 aspect-[9/10] bg-ey-dark rounded-4xl border-ey-turquoise border-3"></div>
        </div>
      </div>
    </section>
  );
}
