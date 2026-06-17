import { Paragraph } from "@/components/website/ui/Paragraph";
import { Title } from "@/components/website/ui/Title";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "EyTickets | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default function FAQS() {
  return (
    <>
      <section className="py-22 bg-linear-to-b from-black to-ey-turquoise-darker to-80%">
        <div className="container text-white py-10 flex flex-col gap-10">
          <Title as="h1" className="font-bold uppercase text-[clamp(2.5rem,8vw,4rem)] leading-[1]">
            Preguntas <span className="text-ey-turquoise">Frecuentes</span>
          </Title>

          <div className="mb-6">
            <Title className="text-2xl text-white font-semibold mb-4">
              PARA COMPRADORES
            </Title>
            <Paragraph className="text-xl text-white mb-6">
              <strong>1. ¿Cómo compro un ticket?</strong>
              <br />
              Selecciona el evento en la plataforma, haz clic en {"Comprar"} y
              completa tus datos (nombre, DNI y email). El pago se realiza a
              través de Mercado Pago.
              <br />
              <br />
              <strong>2. ¿Puedo transferir o revender mi ticket?</strong>
              <br />
              No. Los tickets son intransferibles y el QR está vinculado al DNI
              del comprador original. Si no puedes asistir, contacta al
              Organizador del evento (EyTickets no gestiona reembolsos ni
              cambios).
              <br />
              <br />
              <strong>3. ¿Qué pasa si el evento se cancela o pospone?</strong>
              <br />
              La responsabilidad es exclusiva del Organizador. Debes contactarlo
              directamente para solicitar reembolsos o cambios. EyTickets no
              interviene en estas gestiones.
              <br />
              <br />
              <strong>4. ¿Hay cargos adicionales?</strong>
              <br />
              El precio final incluye: Costo del ticket (fijado por el
              Organizador). Comisión del 3% por uso de la plataforma (asumida
              por el Organizador).
              <br />
              <br />
              <strong>5. ¿Cómo uso mi ticket?</strong>
              <br />
              Al llegar al evento, presenta: El QR recibido por email (válido
              solo con el DNI registrado).
            </Paragraph>
          </div>

          <div className="mb-6">
            <Title className="text-2xl text-white font-semibold mb-4">
              PARA ORGANIZADORES
            </Title>
            <Paragraph className="text-xl text-white  mb-6">
              <strong>1. ¿Cómo vendo tickets en EyTickets?</strong>
              <br />
              Regístrate como Organizador, configura tu evento (fecha, precio,
              capacidad) y publica. Los pagos se reciben directamente en tu
              cuenta de Mercado Pago.
              <br />
              <br />
              <strong>2. ¿Qué comisión cobra EyTickets?</strong>
              <br />
              Un 3% del valor de cada ticket vendido, abonable post-evento
              mediante transferencia bancaria o efectivo.
              <br />
              <br />
              <strong>3. ¿Puedo cancelar o modificar un evento?</strong>
              <br />
              Sí, pero debes gestionar directamente con los compradores
              cualquier reembolso o cambio. EyTickets no se responsabiliza por
              reclamos derivados.
              <br />
              <br />
              <strong>4. ¿Cómo evito la reventa?</strong>
              <br />
              Los tickets emitidos en EyTickets tienen un QR vinculado al DNI
              del comprador, lo que garantiza su autenticidad y evita reventas.
              <br />
              <br />
              <strong>5. ¿Qué datos de los compradores recibo?</strong>
              <br />
              Solo los necesarios para el evento: nombre, DNI y email. Estos
              datos son privados y no pueden ser compartidos con terceros.
            </Paragraph>
          </div>

          <div className="mb-6">
            <Title className="text-2xl text-white font-semibold mb-4">
              SEGURIDAD Y SOPORTE
            </Title>
            <Paragraph className="text-xl text-white mb-6">
              <strong>1. ¿Es seguro pagar con Mercado Pago?</strong>
              <br />
              Sí, Mercado Pago cumple con los estándares de seguridad
              internacionales. EyTickets no almacena datos bancarios.
              <br />
              <br />
              <strong>2. ¿Qué hago si no recibo mi ticket?</strong>
              <br />
              Revisa tu correo electrónico (incluida la carpeta de spam). Si
              persiste el problema, contacta a soporte@eytickets.ar.
              <br />
              <br />
              <strong>3. ¿Cómo reporto un problema técnico?</strong>
              <br />
              Envía un email a soporte@eytickets.ar con detalles del error
              (capturas de pantalla, navegador usado, etc.).
            </Paragraph>
          </div>
        </div>
      </section>
    </>
  );
}
