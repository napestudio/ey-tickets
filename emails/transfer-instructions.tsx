import { Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME } from "@/lib/constants";

type TransferInstructionsEmailProps = {
  eventTitle: string;
  orderReference: string;
  ticketTitle: string;
  quantity: number;
  totalPrice: number;
  cbu?: string | null;
  alias?: string | null;
  transferEmail?: string | null;
  instructions?: string | null;
};

export function TransferInstructionsEmail({
  eventTitle,
  orderReference,
  ticketTitle,
  quantity,
  totalPrice,
  cbu,
  alias,
  transferEmail,
  instructions,
}: TransferInstructionsEmailProps) {
  return (
    <EmailLayout>
      <Section className="p-5 border-b border-gray-200">
        <Text className="font-normal text-[#222222]">
          Instrucciones de pago — <strong>{eventTitle}</strong>
        </Text>
      </Section>
      <Section className="p-5 text-left">
        <Text className="text-lg leading-relaxed text-[#222222]">
          Elegiste pagar por transferencia bancaria. Tu orden quedará
          pendiente hasta que el organizador confirme la recepción del pago.
        </Text>

        <Text className="text-base text-[#555555] mt-2">
          {ticketTitle} x{quantity} — Total: ${totalPrice.toLocaleString("es-AR")}
        </Text>
        <Text className="text-sm text-gray-500">
          Referencia de tu orden: <strong>{orderReference}</strong>
        </Text>

        <Section className="mt-4 p-4 border border-gray-200 rounded-lg">
          {cbu && (
            <Text className="text-base text-[#222222]">
              CBU/CVU: <strong>{cbu}</strong>
            </Text>
          )}
          {alias && (
            <Text className="text-base text-[#222222]">
              Alias: <strong>{alias}</strong>
            </Text>
          )}
          {transferEmail && (
            <Text className="text-base text-[#222222]">
              Enviar el comprobante a: <strong>{transferEmail}</strong>
            </Text>
          )}
          {instructions && (
            <Text className="text-sm text-[#555555] mt-2">{instructions}</Text>
          )}
        </Section>

        <Text className="text-base leading-relaxed text-[#222222] mt-4">
          Una vez que hagas la transferencia,{" "}
          {transferEmail ? (
            <>
              enviá el comprobante a <strong>{transferEmail}</strong>
            </>
          ) : (
            "enviale el comprobante al organizador"
          )}{" "}
          mencionando la referencia de tu orden ({orderReference}). Cuando
          confirme el pago vas a recibir tus entradas en este mismo correo.
        </Text>

        <Text className="text-sm text-gray-500 mt-5">
          Enviado por {SITE_NAME}.
        </Text>
      </Section>
    </EmailLayout>
  );
}
