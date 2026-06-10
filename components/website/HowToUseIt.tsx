import HowItWorksCard from "./HowItWorksCard";
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
    <section className="py-24 bg-linear-to-b to-black from-ey-turquoise-darker to-80%">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-start overflow-hidden">
          <div className="w-full md:w-2/5 aspect-[9/10] bg-ey-dark rounded-4xl border-ey-turquoise border-3"></div>
          <div className="w-full md:w-3/5 flex flex-col">
            <div className="flex flex-col text-white mb-5">
              <Title className="font-bold uppercase text-6xl">Cómo <span className="text-ey-turquoise">se usa?</span></Title>
              <Paragraph size="sm" className="mt-4 text-white ">
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
