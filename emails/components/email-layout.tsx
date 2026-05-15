import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Section,
  Tailwind,
  pixelBasedPreset,
} from "react-email";

const tailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        brand: "#016fd0",
        accent: "#e65a25",
        dark: "#0f172a",
        success: "#019645",
      },
    },
  },
};

type EmailLayoutProps = {
  children: React.ReactNode;
};

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Tailwind config={tailwindConfig}>
        <Body className="bg-brand p-5 m-0 font-sans">
          <Section className="text-center mb-4">
            <Img
              src={`${process.env.BASE_URL}/email-logo.png`}
              width="160"
              alt="EyTickets"
            />
          </Section>
          <Container className="max-w-[600px] mx-auto bg-white overflow-hidden border-4 border-black rounded-lg">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
