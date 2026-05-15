import { Column, Img, Link, Row, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";

export type QrTicketEmailData = {
  code: number;
  path: string;
  date: Date;
  ticketType: { title: string };
};

type TicketConfirmationEmailProps = {
  eventTitle: string;
  eventLocation: string;
  eventAddress: string;
  tickets: QrTicketEmailData[];
};

function formatTicketDate(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}hs`;
}

export function TicketConfirmationEmail({
  eventTitle,
  eventLocation,
  eventAddress,
  tickets,
}: TicketConfirmationEmailProps) {
  return (
    <EmailLayout>
      <Section className="bg-white p-5 text-center border-b border-gray-200">
        <Text className="uppercase text-black m-0 font-bold text-2xl">
          <span className="font-extrabold">¡Hola! </span>
          <span className="font-normal">
            Estas son tus entradas para {eventTitle}
          </span>
        </Text>
      </Section>
      <Section className="p-5">
        {tickets.map((ticket, i) => (
          <Row
            key={i}
            style={{ border: "1px solid #e2e8f0", marginBottom: "1rem" }}
          >
            <Column style={{ width: "75%", padding: "1rem" }}>
              <Text className="text-sm text-black m-0">
                N.: {String(ticket.code).padStart(5, "0")}
              </Text>
              <Text className="text-2xl text-black m-0">{eventTitle}</Text>
              <Text className="text-base text-black m-0">
                {ticket.ticketType.title}
              </Text>
              <Text className="text-sm text-black m-0">
                Lugar: <strong>{eventLocation}</strong>
              </Text>
              <Text className="text-sm text-black m-0">
                Dirección: <strong>{eventAddress}</strong>
              </Text>
              <Text className="text-sm text-black m-0">
                Fecha: <strong>{formatTicketDate(ticket.date)}</strong>
              </Text>
            </Column>
            <Column
              style={{
                borderLeft: "1px dashed #e2e8f0",
                width: "25%",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              <Img src={ticket.path} alt={eventTitle} width="100%" />
            </Column>
          </Row>
        ))}
        <Text className="text-lg leading-relaxed text-[#222222]">
          Recordá llevar tu dni. ¡Nos vemos ahí!.
        </Text>
        <Link
          href={`${process.env.BASE_URL}terminos-y-condiciones`}
          className="text-dark underline"
        >
          Términos y Condiciones de Uso
        </Link>
      </Section>
    </EmailLayout>
  );
}
