import { Button, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";
import { SITE_NAME } from "@/lib/constants";

type PasswordResetEmailProps = {
  resetToken: string;
};

export function PasswordResetEmail({ resetToken }: PasswordResetEmailProps) {
  const resetUrl = `${process.env.BASE_URL}/ingresar/new-password/${resetToken}`;
  const subject = `Recuperar contraseña de ${SITE_NAME}`;

  return (
    <EmailLayout>
      <Section className="bg-white p-5 text-center border-b border-gray-200">
        <Text className="uppercase text-black m-0 text-2xl">
          <span className="font-extrabold">¡Hola! </span>
          <span className="font-normal">{subject}</span>
        </Text>
      </Section>
      <Section className="p-5 text-center">
        <Text className="text-xl leading-none text-black">
          Para reiniciar tu contraseña, hace click en el siguiente enlace.
        </Text>
        <Button
          href={resetUrl}
          className="bg-accent text-white border-4 border-black px-6 py-4 text-base mt-5"
          style={{ boxShadow: "5px 5px 0px 0 black" }}
        >
          Reiniciar contraseña
        </Button>
        <Text className="text-sm text-black mt-5">¡Gracias!</Text>
      </Section>
    </EmailLayout>
  );
}
