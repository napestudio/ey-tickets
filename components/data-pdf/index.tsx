"use client";

import { Button } from "../ui/button";
import { Download, FileText } from "lucide-react";
import { getAllTicketsForExportAction, getAllTicketsForExportValidatorAction } from "@/lib/actions";

type ExportRow = {
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
  dni?: string | null;
  createdAt?: Date | string | null;
  isInvitation?: boolean | null;
  ticketType?: { title?: string | null } | null;
};

interface ExportEventAsPDFProps {
  eventTitle: string;
  quantity: number;
  type?: "ESTADISTICAS" | "VALIDADOR";
  /** Pass pre-fetched tickets (validator page). */
  ticketsData?: ExportRow[];
  /** Pass eventId to fetch all tickets lazily on export (dashboard). */
  eventId?: string;
  /** Validator session id — when provided, uses the session-authenticated export action. */
  sessionId?: string;
}

export default function ExportEventAsPDF({
  eventTitle,
  ticketsData,
  eventId,
  sessionId,
  quantity,
  type = "VALIDADOR",
}: ExportEventAsPDFProps) {
  async function resolveData() {
    if (ticketsData) return ticketsData;
    if (eventId && sessionId) {
      return getAllTicketsForExportValidatorAction(eventId, sessionId);
    }
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

    const rows = data as ExportRow[];
    const regular = rows.filter((t) => !t.isInvitation);
    const invitations = rows.filter((t) => t.isInvitation);

    const toRow = (ticket: ExportRow): string[] => {
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
        ticket.ticketType?.title ?? "",
        createdAt,
      ];
    };

    const tableHead = [
      ["Comprador", "Email", "DNI", "TIPO", "FECHA DE COMPRA"],
    ];

    autoTable(doc, {
      startY: 50,
      head: tableHead,
      body: regular.map(toRow),
    });

    if (invitations.length > 0) {
      const lastY = (doc as unknown as { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY;
      doc.text("INVITACIONES", 20, lastY + 14);
      autoTable(doc, {
        startY: lastY + 20,
        head: tableHead,
        body: invitations.map(toRow),
      });
    }

    doc.save(`${eventTitle}_reporte_tickets.pdf`);
  };

  const exportXLSX = async () => {
    const data = await resolveData();
    const { default: ExcelJS } = await import("exceljs");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    worksheet.addRow(["Nombre", "Email", "DNI", "TIPO", "FECHA DE COMPRA"]);

    const rows = data as ExportRow[];
    const regular = rows.filter((t) => !t.isInvitation);
    const invitations = rows.filter((t) => t.isInvitation);

    const addTicketRow = (ticket: ExportRow) => {
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
        ticket.ticketType?.title ?? "",
        createdAt,
      ]);
    };

    regular.forEach(addTicketRow);

    if (invitations.length > 0) {
      worksheet.addRow([]);
      worksheet.addRow(["INVITACIONES"]);
      worksheet.addRow(["Nombre", "Email", "DNI", "TIPO", "FECHA DE COMPRA"]);
      invitations.forEach(addTicketRow);
    }

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
    <div className="flex items-center gap-2">
      <Button
        className="w-full cursor-pointer py-5 bg-neutral-100 text-neutral-900"
        onClick={exportPDF}
        variant="outline"
      >
        <span className="mr-4">Lista PDF</span> <Download />
      </Button>
      {type !== "VALIDADOR" && (
        <Button
          className="w-full cursor-pointer py-5 bg-neutral-100 text-neutral-900"
          onClick={exportXLSX}
          variant="outline"
        >
          <span className="mr-4">Lista XLSX</span> <FileText />
        </Button>
      )}
    </div>
  );
}
