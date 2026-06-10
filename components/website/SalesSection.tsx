import { Landmark, LandmarkIcon } from "lucide-react";
import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";
import Image from "next/image";
export default function SalesSection() {
  return (
    <section className="py-24 bg-linear-to-b from-ey-dark to-ey-turquoise-darker">
      <div className="container mx-auto">
        <div className="flex items-center gap-12">
          <div>
            <Title className="font-nebulica font-bold text-white mb-4">
              COBRA AL INSTANTE
            </Title>
            <Paragraph className="text-white">
              No esperes a que finalice el evento para cobrar tus ventas.
            </Paragraph>
            <Paragraph className="text-white">
              El dinero de tus ventas se acredita al instante en tu cuenta. Sin
              esperas, sin bloqueos, sin comisiones por venta.
            </Paragraph>
            <div className="flex items-center gap-2 w-max mt-4">
              <div className="h-15 w-max">
                <Image
                  src="https://res.cloudinary.com/dkgnaegp9/image/upload/v1780431352/MP_RGB_HANDSHAKE_pluma_horizontal_zlex65.svg"
                  width={1048}
                  height={425}
                  alt="Mercado Pago Logo svg"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="h-10 w-max flex items-center font-bold gap-2 text-white">
                <LandmarkIcon className="text-white" width={24} />{" "}
                Transferencias
              </div>
            </div>
          </div>
          <div className="w-[600px] aspect-square bg-neutral-100 mt-12"></div>
        </div>
      </div>
    </section>
  );
}
