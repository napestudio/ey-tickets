import { Button, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME } from "@/lib/constants";

type AccountVerificationEmailProps = {
  verificationToken: string;
};

export function AccountVerificationEmail({
  verificationToken,
}: AccountVerificationEmailProps) {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
  const subject = `Verificá tu cuenta en ${SITE_NAME}`;

  return (
    <EmailLayout>
      <Section className="bg-white p-5 text-center border-b border-gray-200">
        <Text className="uppercase text-black m-0 text-2xl">
          <span className="font-extrabold">
            ¡Gracias por registrarte en EyTickets!{" "}
          </span>
          <span className="font-normal">{subject}</span>
        </Text>
      </Section>
      <Section className="p-5 text-center">
        <Text className="text-xl leading-none text-black">
          Para activar tu cuenta y comenzar a vender entradas, hacé click en el
          siguiente enlace.
        </Text>
        <Text className="text-sm text-gray-600 mt-2">
          Este enlace es válido por 24 horas.
        </Text>
        <Button
          href={verificationUrl}
          className="bg-neutral-900 text-white border-4 border-black px-6 py-4 text-base mt-5"
          style={{ boxShadow: "5px 5px 0px 0 black" }}
        >
          Verificar mi cuenta
        </Button>
        <Text className="text-sm text-black mt-5">¡Gracias!</Text>
      </Section>
    </EmailLayout>
  );
}
