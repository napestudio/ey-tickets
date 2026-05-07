import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Yendo.ar | Eventos en vivo",
  description: "Venta de tickets online para eventos en vivo.",
};

export default function TerminosYCondiciones() {
  return (
    <>
      <section className="container pb-14">
        <h1 className="mb-14 mt-10 scroll-m-20 text-4xl tracking-tight lg:text-7xl text-white text-stroke">
          <span className="font-extrabold">Términos y condiciones</span>
        </h1>
        <div>
          <p className="text-xl text-white mb-4">
            {`1. Aceptación de los Términos Al utilizar la plataforma yendo.ar
            (en adelante, "la Plataforma"), el usuario (en adelante, "el
            Organizador" o "el Comprador") acepta estos Términos y Condiciones,
            que regulan la venta de tickets para eventos. La Plataforma es
            operada por una persona física sin nombre comercial, con base en
            Rosario, Santa Fe, Argentina.`}
          </p>
          <p className="text-xl text-white mb-4">
           {`2. Definiciones Plataforma: yendo.ar, sistema autogestivo para venta
            de tickets. Organizador: Productor o responsable del evento que
            publica tickets en la Plataforma. Comprador: Persona que adquiere
            tickets a través de la Plataforma. QR: Código vinculado al DNI del
            Comprador, intransferible.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`3. Proceso de Venta y Pagos Funcionamiento: La Plataforma actúa como
            intermediario entre el Organizador y el Comprador. El Organizador
            configura los datos del evento (precio, fecha, condiciones). El pago
            se procesa a través de Mercado Pago; los fondos son recibidos
            directamente por el Organizador. Comisión: yendo.ar retiene un 3%
            del valor de cada ticket vendido, abonable post-evento mediante
            transferencia bancaria o efectivo.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`4. Política de Cancelaciones y Reembolsos No se aceptan
            cancelaciones, devoluciones ni cambios una vez emitido el ticket. En
            caso de postergación o cancelación del evento, la responsabilidad
            recae exclusivamente en el Organizador, quien debe gestionar
            soluciones con los Compradores. yendo.ar no interviene en
            reembolsos.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`5. Responsabilidades Del Organizador: Garantizar la veracidad de la
            información del evento. Cumplir con las obligaciones legales (ej:
            reembolsos si el evento no se realiza). Del Comprador: Verificar los
            datos del evento antes de comprar. Presentar el QR asociado a su DNI
            para ingresar al evento. De yendo.ar: No es responsable por la
            realización, calidad o cambios en los eventos. Garantiza la
            autenticidad del QR emitido, pero no su validez si el evento es
            cancelado.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`6. Privacidad y Protección de Datos Los datos personales (DNI,
            email, etc.) son privados e intransferibles, almacenados según la
            Ley 25.326 de Protección de Datos Personales (Argentina). El
            Comprador acepta que su DNI sea vinculado al QR para evitar reventa.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`7. Prohibiciones Reventa de tickets: No está permitida. El QR solo
            es válido para el Comprador original. Uso fraudulento: Cualquier
            intento de duplicar o alterar tickets resultará en la anulación sin
            reembolso.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`8. Jurisdicción y Ley Aplicable Estos Términos se rigen por las
            leyes de la Provincia de Santa Fe, Argentina. Para conflictos, las
            partes se someten a los tribunales de Rosario, con renuncia expresa
            a cualquier otro fuero.`}
          </p>
          <p className="text-xl text-white mb-4">
            {`9. Modificaciones yendo.ar puede actualizar estos Términos en
            cualquier momento. Los cambios serán notificados en la Plataforma y
            entrarán en vigor inmediatamente después de su publicación.`}
          </p>
        </div>
      </section>
    </>
  );
}
