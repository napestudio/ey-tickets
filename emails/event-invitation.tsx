import { Button, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME } from "@/lib/constants";

type EventInvitationEmailProps = {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  customizationUrl?: string;
};

export function EventInvitationEmail({
  eventTitle,
  eventDate,
  eventLocation,
  customizationUrl,
}: EventInvitationEmailProps) {
  return (
    <EmailLayout>
      <Section className="p-5 border-b border-gray-200">
        <Text className="font-normal text-[#222222]">
          Invitación — <strong>{eventTitle}</strong>
        </Text>
      </Section>
      <Section className="p-5 text-left">
        <Text className="text-lg leading-relaxed text-[#222222]">
          Tenés una invitación para el evento:
        </Text>
        <Text className="text-xl font-bold text-[#222222]">{eventTitle}</Text>
        <Text className="text-base text-[#555555]">
          {eventDate} · {eventLocation}
        </Text>

        {customizationUrl ? (
          <>
            <Text className="text-base leading-relaxed text-[#222222] mt-4">
              Para completar tu invitación y recibir tu entrada, hacé clic en el
              botón de abajo y completá tus datos.
            </Text>
            <Button
              href={customizationUrl}
              className="bg-dark text-white px-6 py-3 text-base rounded-lg mt-4"
            >
              Completar mis datos
            </Button>
            <Text className="text-xs text-gray-500 mt-4">
              Este link es de uso único. Una vez que completes tus datos, no
              podrás modificarlos.
            </Text>
          </>
        ) : (
          <Text className="text-base leading-relaxed text-[#222222] mt-4">
            Tu entrada fue creada. El organizador del evento te enviará los
            detalles de acceso.
          </Text>
        )}

        <Text className="text-sm text-gray-500 mt-5">
          Si no esperabas esta invitación, simplemente ignorá este mensaje.
          Enviado por {SITE_NAME}.
        </Text>
      </Section>
    </EmailLayout>
  );
}
