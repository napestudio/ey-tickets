import Image from "next/image";
import { Button } from "./ui/Button";
import { Title } from "./ui/Title";
import { Paragraph } from "./ui/Paragraph";
import ScrollToButton from "./ScrollToButton";

export default function WebsiteHero() {
  return (
    <div className="min-h-screen pt-24 md:pt-42 pb-24 bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80% relative flex items-center">
      <div className="bg-ey-dark absolute inset-0">
        <Image
          src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780428893/DSC03295_nkpicy.jpg"
          width="1400"
          height="933"
          className="w-full h-full object-cover object-bottom grayscale opacity-80"
          alt=""
        />
      </div>
      <div className="container relative mx-auto text-white h-full lg:px-24 font-nebulica">
        <div className="h-full flex items-center justify-start">
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <Paragraph className="letter-spacing-wide lg:text-2xl text-ey-turquoise font-semibold">
              CREA TU EVENTO EN MINUTOS
            </Paragraph>
            <Title
              as="h1"
              className="font-bold uppercase text-[clamp(1.8rem,8vw,4rem)] leading-[1]"
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
              <ScrollToButton
                target="#how-it-works"
                className="border-2 text-ey-turquoise font-medium border-ey-turquoise uppercase rounded-2xl hover:bg-ey-turquoise hover:text-ey-dark transition-colors text-center"
              >
                Cómo funciona
              </ScrollToButton>
            </div>
          </div>
        </div>
        <div className="hidden absolute top-10 md:top-0 right-30 w-1/12 md:w-1/8 md:flex gap-4">
          <Image
            src="/images/cross.svg"
            width={50}
            height={40}
            alt="VENDE ENTRADAS SIN COMISIONES"
          />
          <Image
            src="/images/tkt-red.svg"
            width={100}
            height={45}
            alt="VENDE ENTRADAS SIN COMISIONES"
          />
          <Image
            src="/images/red-hot.svg"
            width={50}
            height={40}
            alt="VENDE ENTRADAS SIN COMISIONES"
          />
        </div>
      </div>
    </div>
  );
}
