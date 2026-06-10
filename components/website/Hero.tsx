import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Paragraph } from "./ui/Paragraph";
import Image from "next/image";

export default function WebsiteHero() {
  return (
    <div className="h-svh pt-24 bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80% relative">
      <div className="bg-neutral-200 absolute w-full h-full inset-0">
        <Image
          src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
          width="1500"
          height="1000"
          className="w-full h-full object-cover object-bottom"
          alt=""
        />
      </div>
      <div className="container mx-auto text-white h-full relative">
        <div className="h-full flex items-center justify-start pb-12">
          <div>
            <Paragraph className="letter-spacing-wide text-ey-gray font-semibold">
              CREA TU EVENTO EN MINUTOS
            </Paragraph>
            <h1 className="text-8xl text-white font-nebulica font-bold">
              VENDE ENTRADAS
              <span className="block text-transparent [text-stroke:2px_white] [-webkit-text-stroke:2px_#fff]">
                SIN COMISIONES
              </span>
            </h1>
            <Paragraph size="sm" className="letter-spacing-wide">
              Vendé entradas online de forma simple, rápida y sin
              intermediarios.
              <br />
              <span className="text-ey-turquoise">
                Con EyTickets cobras vos, controlas vos.
              </span>
            </Paragraph>
            <div className="flex gap-4 items-center py-6">
              <Button
                className="border-2 border-ey-turquoise-dark uppercase"
                href="/dashboard"
              >
                Creá tu evento
              </Button>
              <Button
                href="#how-it-works"
                variant="primary"
                className="bg-ey-turquoise-dark uppercase"
              >
                Cómo funciona
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
