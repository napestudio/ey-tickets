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
        "ey-turquoise": "#3addbe",
        "ey-turquoise-dark": "#33c1a6",
        "ey-turquoise-darker": "#0f3730",
        "ey-dark": "#111111",
        "ey-gray": "#ededed",
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
        <Body
          style={{ backgroundColor: "#111111", margin: 0, padding: "20px 0" }}
          className="font-sans"
        >
          <Section className="text-center mb-4">
            <Img
              src={`${process.env.BASE_URL}/images/Logo.svg`}
              width="160"
              alt="EyTickets"
              className="mx-auto py-10"
            />
          </Section>
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              borderRadius: "12px",
              border: "3px solid #3addbe",
            }}
          >
            {children}
          </Container>
          <Section className="text-center mt-4">
            <p
              style={{
                color: "#3addbe",
                fontSize: "12px",
                margin: 0,
                opacity: 0.7,
              }}
            >
              © EYTickets — eytickets.ar
            </p>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
