"use client";

import { TicketOrderTableProps } from "@/types/tickets";
import { Button } from "../ui/button";
import { Download, FileText } from "lucide-react";
import { getAllTicketsForExportAction } from "@/lib/actions";

interface ExportEventAsPDFProps {
  eventTitle: string;
  quantity: number;
  type?: "ESTADISTICAS" | "VALIDADOR";
  /** Pass pre-fetched tickets (validator page). */
  ticketsData?: Partial<TicketOrderTableProps>[];
  /** Pass eventId to fetch all tickets lazily on export (dashboard). */
  eventId?: string;
}

export default function ExportEventAsPDF({
  eventTitle,
  ticketsData,
  eventId,
  quantity,
  type = "VALIDADOR",
}: ExportEventAsPDFProps) {
  async function resolveData() {
    if (ticketsData) return ticketsData;
    if (eventId) {
      return getAllTicketsForExportAction(eventId);
    }
    return [];
  }

  const exportPDF = async () => {
    const data = await resolveData();
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Reporte de Tickets", 20, 10);
    doc.text(`Evento: ${eventTitle}`, 20, 20);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Entradas vendidas: ${quantity}`, 20, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Comprador", "Email", "DNI", "TIPO", "FECHA DE COMPRA"]],
      body: data.map((ticket) => {
        const createdAt =
          ticket.createdAt instanceof Date
            ? ticket.createdAt.toLocaleDateString()
            : ticket.createdAt
              ? String(ticket.createdAt)
              : "";
        return [
          `${ticket.name ?? ""} ${ticket.lastName ?? ""}`.trim(),
          ticket.email ?? "",
          ticket.dni ?? "",
          (ticket as Partial<TicketOrderTableProps>).ticketType?.title ?? "",
          createdAt,
        ];
      }),
    });

    doc.save(`${eventTitle}_reporte_tickets.pdf`);
  };

  const exportXLSX = async () => {
    const data = await resolveData();
    const { default: ExcelJS } = await import("exceljs");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    worksheet.addRow(["Nombre", "Email", "DNI", "TIPO", "FECHA DE COMPRA"]);

    data.forEach((ticket) => {
      const createdAt =
        ticket.createdAt instanceof Date
          ? ticket.createdAt.toLocaleDateString()
          : ticket.createdAt
            ? String(ticket.createdAt)
            : "";
      worksheet.addRow([
        `${ticket.name ?? ""} ${ticket.lastName ?? ""}`.trim(),
        ticket.email ?? "",
        ticket.dni ?? "",
        (ticket as Partial<TicketOrderTableProps>).ticketType?.title ?? "",
        createdAt,
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${eventTitle}_reporte_tickets.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button onClick={exportPDF} variant="outline">
        <span className="mr-4">Descargar Lista PDF</span> <Download />
      </Button>
      {type !== "VALIDADOR" && (
        <Button onClick={exportXLSX} variant="outline">
          <span className="mr-4">Descargar Lista XLSX</span> <FileText />
        </Button>
      )}
    </>
  );
}
