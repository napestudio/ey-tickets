import { ContactForm } from "@/components/website/Contactform";
import { Paragraph } from "@/components/website/ui/Paragraph";
import { Title } from "@/components/website/ui/Title";
import SmoothScrollProvider from "@/lib/smoothScrollProvider";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default function Contacts() {
  return (
    <>
      <SmoothScrollProvider>
        <section className="py-22 bg-linear-to-b from-black to-ey-turquoise-darker to-80%">
          <div className="container text-white py-10 flex gap-10">
            <div className="w-2/2 md:w-1/2 flex flex-col gap-4">
              <Title
                as="h1"
                className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-[1]"
              >
                Contacto
              </Title>
              <Title as="h2" className="text-2xl">
                {" "}
                ¿Tenés alguna duda?
              </Title>
              <Paragraph className="text-ey-turquoise text-sm leading-relaxed max-w-sm">
                Estamos para ayudarte. Ya sea que tengas preguntas sobre tu
                cuenta, un evento o tus entradas, escribinos y te respondemos a
                la brevedad.
              </Paragraph>
              <Paragraph className="text-ey-turquoise text-sm leading-relaxed max-w-sm">
                También podés contactarnos por{" "}
                <a
                  href="mailto:hola@eytickets.ar"
                  className="text-white hover:underline"
                >
                  hola@eytickets.ar
                </a>{" "}
                o seguirnos en{" "}
                <a
                  href="https://instagram.com/eytickets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  @eytickets
                </a>{" "}
                en Instagram.
              </Paragraph>
              <Paragraph></Paragraph>
            </div>
            <div className="w-2/2 md:w-1/2">
              <ContactForm />
            </div>
          </div>
        </section>
      </SmoothScrollProvider>
    </>
  );
}
