import { format } from "date-fns";
import { es } from "date-fns/locale";
import { slugify } from "@/lib/utils";

export type TicketDetail = {
  id: string;
  buyerName?: string | null;
  buyerLastName?: string | null;
  email?: string | null;
  dni?: string | null;
  code?: string | number | null;
};

export type TicketsPdfParams = {
  /** Use when there is no buyer data (e.g. quick-sale). */
  ticketIds?: string[];
  /** Use when buyer data is available. IDs are derived from each detail. */
  ticketDetails?: TicketDetail[];
  eventTitle: string;
  ticketTypeTitle: string;
  generatedAt: string;
  filename?: string;
};

function estimateTicketHeight(
  detail: TicketDetail | undefined,
  qrSize: number,
): number {
  if (detail) {
    let h = 0;
    if (detail.buyerName || detail.buyerLastName) h += 10; // name, up to ~2 lines
    if (detail.email) h += 4;
    if (detail.dni) h += 4;
    h += qrSize + 2; // QR
    if (detail.code != null) h += 4; // N.° below QR
    h += 4; // "Entrada X de N" (small, below QR)
    h += 3; // bottom spacing
    return h;
  } else {
    return qrSize + 2 + 4 + 4 + 3; // QR + "Venta Puerta" + "Entrada X de N" + spacing
  }
}

export async function generateTicketsPdf({
  ticketIds,
  ticketDetails,
  eventTitle,
  ticketTypeTitle,
  generatedAt,
  filename,
}: TicketsPdfParams): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const ids = ticketDetails
    ? ticketDetails.map((d) => d.id)
    : (ticketIds ?? []);

  const MM_WIDTH = 58;
  const margin = 6;
  const contentWidth = MM_WIDTH - margin * 2;
  const qrSize = contentWidth * 0.8;
  const N = ids.length;

  const ticketsHeight = ids.reduce(
    (sum, _, i) => sum + estimateTicketHeight(ticketDetails?.[i], qrSize),
    0,
  );
  const pageHeight =
    margin + 25 + ticketsHeight + (N - 1) * 3 + margin;

  const doc = new jsPDF({
    unit: "mm",
    format: [MM_WIDTH, pageHeight],
    orientation: "portrait",
  });

  let y = margin;

  const generatedDate = new Date(generatedAt);
  const formattedDate = format(generatedDate, "dd/MM/yyyy HH:mm", {
    locale: es,
  });

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(eventTitle, contentWidth);
  doc.text(titleLines, MM_WIDTH / 2, y, { align: "center" });
  y += titleLines.length * 4 + 1;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const ticketTypeLines = doc.splitTextToSize(ticketTypeTitle, contentWidth);
  doc.text(ticketTypeLines, MM_WIDTH / 2, y, { align: "center" });
  y += ticketTypeLines.length * 3.5 + 1;

  doc.setFontSize(6);
  doc.text(`Generado: ${formattedDate}`, MM_WIDTH / 2, y, {
    align: "center",
  });
  y += 5;

  for (let idx = 0; idx < ids.length; idx++) {
    const ticketId = ids[idx];
    const detail = ticketDetails?.[idx];

    if (idx > 0) {
      doc.setDrawColor(180, 180, 180);
      doc.line(margin, y, MM_WIDTH - margin, y);
      y += 3;
    }

    if (detail) {
      // Buyer name
      const buyerName = [detail.buyerName, detail.buyerLastName]
        .filter(Boolean)
        .join(" ");
      if (buyerName) {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const buyerLines = doc.splitTextToSize(buyerName, contentWidth);
        doc.text(buyerLines, MM_WIDTH / 2, y, { align: "center" });
        y += buyerLines.length * 3.5 + 1;
      }

      // Email (between name and DNI)
      if (detail.email) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        const emailLines = doc.splitTextToSize(detail.email, contentWidth);
        doc.text(emailLines, MM_WIDTH / 2, y, { align: "center" });
        y += emailLines.length * 3 + 1;
      }

      // DNI
      if (detail.dni) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(`DNI: ${detail.dni}`, MM_WIDTH / 2, y, { align: "center" });
        y += 4;
      }
    }

    // QR code
    try {
      const qrUrl = `/api/tickets/qr/${ticketId}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const qrDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const qrX = (MM_WIDTH - qrSize) / 2;
      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
      y += qrSize + 2;
    } catch {
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text("[QR no disponible]", MM_WIDTH / 2, y + 5, {
        align: "center",
      });
      y += 10;
    }

    // Below QR: ticket number and entry label
    if (detail) {
      if (detail.code != null) {
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(
          `N.° ${String(detail.code).padStart(5, "0")}`,
          MM_WIDTH / 2,
          y,
          { align: "center" },
        );
        y += 4;
      }
    } else {
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.text(`Venta Puerta`, MM_WIDTH / 2, y, { align: "center" });
      y += 4;
    }

    // "Entrada X de N" — smaller, below QR for all tickets
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(`Entrada ${idx + 1} de ${ids.length}`, MM_WIDTH / 2, y, {
      align: "center",
    });
    y += 7;
  }

  const outputFilename =
    filename ??
    `ticket-${slugify(eventTitle)}-${formattedDate.replace(/[/:]/g, "-")}.pdf`;
  doc.save(outputFilename);
}
