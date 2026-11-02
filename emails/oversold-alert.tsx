import { Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME } from "@/lib/constants";

type OversoldAlertEmailProps = {
  eventTitle: string;
  ticketTitle: string;
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  ticketTypeQuantity: number;
  totalPaidQuantity: number;
};

export function OversoldAlertEmail({
  eventTitle,
  ticketTitle,
  orderReference,
  buyerName,
  buyerEmail,
  quantity,
  ticketTypeQuantity,
  totalPaidQuantity,
}: OversoldAlertEmailProps) {
  return (
    <EmailLayout>
      <Section className="p-5 border-b border-gray-200">
        <Text className="font-normal text-[#222222]">
          Venta por encima del stock — <strong>{eventTitle}</strong>
        </Text>
      </Section>
      <Section className="p-5 text-left">
        <Text className="text-lg leading-relaxed text-[#222222]">
          Se confirmó un pago para <strong>{ticketTitle}</strong> justo cuando
          ya no quedaba stock disponible (dos compradores pagaron casi al
          mismo tiempo por las últimas entradas). La entrada se emitió igual
          para no dejar sin su compra a quien ya pagó.
        </Text>

        <Section className="mt-4 p-4 border border-gray-200 rounded-lg">
          <Text className="text-base text-[#222222]">
            Orden: <strong>{orderReference}</strong>
          </Text>
          <Text className="text-base text-[#222222]">
            Comprador: <strong>{buyerName}</strong> ({buyerEmail})
          </Text>
          <Text className="text-base text-[#222222]">
            Cantidad de esta orden: <strong>{quantity}</strong>
          </Text>
          <Text className="text-base text-[#222222]">
            Stock configurado: <strong>{ticketTypeQuantity}</strong> — total
            pagado ahora: <strong>{totalPaidQuantity}</strong>
          </Text>
        </Section>

        <Text className="text-base leading-relaxed text-[#222222] mt-4">
          El tipo de entrada se marcó como agotado para frenar nuevas ventas.
          Si hace falta, podés sumar stock desde el panel de control de stock
          del tipo de entrada.
        </Text>

        <Text className="text-sm text-gray-500 mt-5">
          Enviado por {SITE_NAME}.
        </Text>
      </Section>
    </EmailLayout>
  );
}
