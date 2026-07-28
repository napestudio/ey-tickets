import { Button, Link, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME, SITE_PROD_URL } from "@/lib/constants";

type UserInvitationEmailProps = {
  roleLabel: string;
  invitationId: string;
  invitationToken: string;
};

export function UserInvitationEmail({
  roleLabel,
  invitationId,
  invitationToken,
}: UserInvitationEmailProps) {
  const acceptUrl = `${process.env.BASE_URL}/api/invitations/accept?id=${invitationId}&t=${invitationToken}`;

  return (
    <EmailLayout>
      <Section className="p-5 border-b border-gray-200">
        <Text className="font-normal text-[#222222]">
          Invitación a <strong>{SITE_NAME}</strong>
        </Text>
      </Section>
      <Section className="p-5 text-left">
        <Text className="text-lg leading-relaxed text-[#222222]">
          Estimado/a,
        </Text>
        <Text className="text-lg leading-relaxed text-[#222222]">
          Has sido invitado a unirte a nuestra plataforma con el rol de{" "}
          <span
            style={{
              letterSpacing: "1px",
              fontSize: "small",
              padding: ".4rem .8rem",
              background: "#019645",
              borderRadius: "5rem",
              color: "white",
              textTransform: "uppercase",
            }}
          >
            {roleLabel}
          </span>
          .
        </Text>
        <Text className="text-lg leading-relaxed text-[#222222]">
          Para completar tu registro y acceder a la plataforma, es necesario que
          leas y aceptes nuestros{" "}
          <Link
            href={`${SITE_PROD_URL}/terminos-y-condiciones`}
            className="text-dark underline"
          >
            Términos y Condiciones de Uso
          </Link>
          .
        </Text>
        <Text className="text-lg leading-relaxed text-[#222222]">
          Al hacer clic en el siguiente botón, confirmás que has leído y aceptas
          los Términos y Condiciones de Uso de {SITE_NAME}.
        </Text>
        <Button
          href={acceptUrl}
          className="bg-dark text-white px-6 py-3 text-base rounded-lg mt-5"
        >
          Aceptar invitación y términos de uso
        </Button>
        <Text className="text-sm text-gray-500 mt-5">
          Si no reconocés esta invitación o no deseás unirte, simplemente ignorá
          este mensaje.
        </Text>
      </Section>
    </EmailLayout>
  );
}
