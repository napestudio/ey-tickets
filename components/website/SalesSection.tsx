import { Landmark, LandmarkIcon } from "lucide-react";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";
import Image from "next/image";

import { ShapeMask } from "./ShapeMask";
import LogoVertical from "../ui/LogoVertical";
export default function SalesSection() {
  return (
    <section className="relative py-24 lg:px-18 bg-linear-to-b to-ey-turquoise-darker from-ey-dark ">
      <div className="absolute inset-0 bg-[url('/images/tkt-sm-pattern.png')] bg-repeat bg-cover bg-center opacity-50 z-0" />
      <div className="relative container mx-auto lg:px-24">
        {/*<ShapeMask borderColor="#060808">*/}
        <div className="flex items-stretch w-full z-20 ">
          <div className="w-1/5 bg-ey-dark border-ey-turquoise border-0 flex items-center justify-center px-4 lg:px-0 py-12 rounded-4xl border-r-0">
            <LogoVertical className="h-48 lg:h-80" />
          </div>
          <div className="w-4/5 flex flex-col bg-ey-dark gap-4 lg:gap-10 items-start justify-center p-8 lg:p-16 border-ey-turquoise border-0 rounded-4xl border-l-0">
            <Title className="font-bold text-white mb-4 text-[clamp(2.5rem,8vw,4.5rem)] leading-[1] text-balance lg:mt-2 mb-0">
              <span className="text-ey-turquoise">COBRÁ</span>
              <br />
              AL INSTANTE
            </Title>
            <div className="flex flex-col lg:flex-row  lg:gap-20 lg:items-end">
              <div className="flex lg:flex-col items-start lg:w-max lg:mt-4">
                <div className="h-10 lg:h-15 w-max">
                  <Image
                    src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780431352/MP_RGB_HANDSHAKE_pluma_horizontal_zlex65.svg"
                    width={1048}
                    height={425}
                    alt="Mercado Pago Logo svg"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="h-10 w-max flex items-center gap-2 text-white text-xs lg:text-lg">
                  <LandmarkIcon className="text-white" width={24} />{" "}
                  Transferencias
                </div>
              </div>
              <div className="text-pretty">
                <Paragraph  className="text-white text-xs md:text-lg mb-2">
                  No esperes a que finalice el evento para cobrar tus ventas.
                </Paragraph>
                <Paragraph className="text-white text-xs md:text-lg">
                  El dinero de tus ventas se acredita al instante en tu cuenta.
                  Sin esperas, sin bloqueos, sin comisiones por venta.
                </Paragraph>
              </div>
            </div>
          </div>
        </div>
        {/*</ShapeMask>*/}
      </div>
      
    </section>
  );
}
