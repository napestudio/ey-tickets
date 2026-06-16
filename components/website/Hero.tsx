import Image from "next/image";
import { Button } from "./ui/Button";
import { Title } from "./ui/Title";
import { Paragraph } from "./ui/Paragraph";

export default function WebsiteHero() {
  return (
    <div className="min-h-screen pt-22 md:pt-42 pb-24 bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80% relative">
      <div className="bg-ey-dark absolute inset-0">
        <Image
          src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
          width="1400"
          height="933"
          className="w-full h-full object-cover object-bottom grayscale opacity-80"
          alt=""
        />
      </div>
      <div className="container mx-auto text-white h-full relative lg:px-24">
        <div className="h-full flex items-center justify-start">
          <div className="w-full max-w-2xl flex flex-col gap-4 md:gap-8">
            <Paragraph
              className="letter-spacing-wide lg:text-2xl text-ey-turquoise font-semibold"
            >
              CREA TU EVENTO EN MINUTOS
            </Paragraph>
            <Title
              as="h1"
              className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-[1]"
            >
              VENDE ENTRADAS
              <span className="block bg-ey-turquoise-dark text-ey-dark p-0 w-fit">
                SIN COMISIONES
              </span>
            </Title>
            <Paragraph className="leading-[1.2] font-semibold lg:text-2xl letter-spacing-wide">
              Vendé entradas online de forma simple, rápida y sin
              intermediarios.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Con EyTickets cobras vos, controlas vos.
            </Paragraph>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-stretch sm:items-center">
              <Button
                className="bg-ey-turquoise uppercase rounded-2xl text-ey-dark font-medium hover:bg-ey-turquoise-dark transition-colors text-center"
                href="/dashboard"
                variant="primary"
              >
                Creá tu evento
              </Button>
              <Button
                href="#how-it-works"
                variant="outline"
                className="border-2 text-ey-turquoise font-medium border-ey-turquoise uppercase rounded-2xl hover:bg-ey-turquoise hover:text-ey-dark transition-colors text-center"
              >
                Cómo funciona
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-30 right-25 w-1/10 flex gap-4">
        <Image src="/images/tkt-red.svg" width={70} height={40} alt="" />
        <Image src="/images/cross.svg" width={50} height={40} alt="" />
        <Image src="/images/red-hot.svg" width={50} height={40} alt="" />
      </div>
    </div>
  );
}
