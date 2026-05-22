import { Column, Hr, Img, Link, Row, Section, Text } from "react-email";
import { EmailLayout } from "./components/email-layout";

export type QrTicketEmailData = {
  code: number;
  ticketId: string;
  date: Date;
  ticketType: { title: string };
};

type QrTicketTemplateData = QrTicketEmailData & {
  qrSrc: string;
};

type TicketConfirmationEmailProps = {
  eventTitle: string;
  eventLocation: string;
  eventAddress: string;
  tickets: QrTicketTemplateData[];
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
      {/* Header */}
      <Section
        style={{
          backgroundColor: "#0f3730",
          padding: "24px 20px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            color: "#3addbe",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "3px",
            textTransform: "uppercase",
            margin: "0 0 8px 0",
          }}
        >
          Confirmación de compra
        </Text>
        <Text
          style={{
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: "800",
            margin: 0,
            lineHeight: "1.2",
          }}
        >
          {eventTitle}
        </Text>
      </Section>

      {/* Intro */}
      <Section style={{ padding: "20px 24px 8px" }}>
        <Text style={{ color: "#111111", fontSize: "16px", margin: 0 }}>
          ¡Hola! Tus entradas están listas. Presentalas al ingresar al evento.
        </Text>
      </Section>

      {/* Tickets */}
      <Section style={{ padding: "8px 24px 16px" }}>
        {tickets.map((ticket, i) => (
          <div key={i}>
            <Row
              style={{
                border: "2px solid #ededed",
                borderRadius: "8px",
                marginBottom: "12px",
                overflow: "hidden",
              }}
            >
              {/* Info column */}
              <Column style={{ width: "70%", padding: "16px" }}>
                <Text
                  style={{
                    color: "#3addbe",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    margin: "0 0 4px 0",
                  }}
                >
                  Entrada N.° {String(ticket.code).padStart(5, "0")}
                </Text>
                <Text
                  style={{
                    color: "#111111",
                    fontSize: "18px",
                    fontWeight: "700",
                    margin: "0 0 4px 0",
                    lineHeight: "1.2",
                  }}
                >
                  {eventTitle}
                </Text>
                <Text
                  style={{
                    display: "inline-block",
                    backgroundColor: "#0f3730",
                    color: "#3addbe",
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 10px",
                    borderRadius: "99px",
                    margin: "0 0 10px 0",
                  }}
                >
                  {ticket.ticketType.title}
                </Text>
                <Text
                  style={{ color: "#555555", fontSize: "13px", margin: "0 0 2px 0" }}
                >
                  📍 <strong>{eventLocation}</strong>
                </Text>
                <Text
                  style={{ color: "#555555", fontSize: "13px", margin: "0 0 2px 0" }}
                >
                  {eventAddress}
                </Text>
                <Text style={{ color: "#555555", fontSize: "13px", margin: 0 }}>
                  🗓 <strong>{formatTicketDate(ticket.date)}</strong>
                </Text>
              </Column>
              {/* QR column */}
              <Column
                style={{
                  width: "30%",
                  borderLeft: "2px dashed #ededed",
                  textAlign: "center",
                  padding: "16px 12px",
                  backgroundColor: "#fafafa",
                }}
              >
                <Img
                  src={ticket.qrSrc}
                  alt={`QR entrada ${ticket.code}`}
                  width="100"
                  height="100"
                  style={{ display: "block", margin: "0 auto 6px" }}
                />
                <Text
                  style={{ color: "#999999", fontSize: "10px", margin: 0, textAlign: "center" }}
                >
                  Escaneá para validar
                </Text>
              </Column>
            </Row>
          </div>
        ))}
      </Section>

      <Hr style={{ borderColor: "#ededed", margin: "0 24px" }} />

      {/* Footer note */}
      <Section style={{ padding: "16px 24px" }}>
        <Text style={{ color: "#555555", fontSize: "14px", margin: "0 0 12px 0" }}>
          Recordá llevar tu DNI. ¡Nos vemos ahí!
        </Text>
        <Link
          href={`${process.env.BASE_URL}/terminos-y-condiciones`}
          style={{ color: "#3addbe", fontSize: "12px" }}
        >
          Términos y Condiciones de Uso
        </Link>
      </Section>
    </EmailLayout>
  );
}
