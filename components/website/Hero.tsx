import Image from "next/image";
import { Button } from "./ui/Button";
import { Title } from "./ui/Title";
import { Paragraph } from "./ui/Paragraph";

export default function WebsiteHero() {
  return (
    <div className="min-h-screen pt-28 bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80% relative">
      <div className="bg-ey-dark absolute w-full h-full inset-0">
        <Image
          src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
          width="1400"
          height="933"
          className="w-full h-full object-cover object-bottom grayscale opacity-80"
          alt=""
        />
      </div>
      <div className="container mx-auto text-white h-full relative lg:px-24">
        <div className="h-full flex items-center justify-start pb-12">
          <div className="w-full max-w-4xl">
            <Paragraph
              size="md"
              className="letter-spacing-wide text-ey-turquoise font-semibold mb-2"
            >
              CREA TU EVENTO EN MINUTOS
            </Paragraph>
            <Title
              as="h1"
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold"
            >
              VENDE ENTRADAS
              <span className="block bg-ey-turquoise-dark text-ey-dark px-0 py-1 mt-2">
                SIN COMISIONES
              </span>
            </Title>
            <Paragraph
              size="md"
              className="letter-spacing-wide py-4"
            >
              Vendé entradas online de forma simple, rápida y sin
              intermediarios.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Con EyTickets cobras vos, controlas vos.
            </Paragraph>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center py-6">
              <Button
                className="border-2 text-ey-turquoise font-medium border-ey-turquoise uppercase rounded-2xl hover:bg-ey-turquoise hover:text-ey-dark transition-colors text-center"
                href="/dashboard"
              >
                Creá tu evento
              </Button>
              <Button
                href="#how-it-works"
                variant="primary"
                className="bg-ey-turquoise uppercase rounded-2xl text-ey-dark font-medium hover:bg-ey-turquoise-dark transition-colors text-center"
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