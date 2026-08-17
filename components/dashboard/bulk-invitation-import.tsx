"use client";

import { useRef, useState } from "react";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Download, FileUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { bulkInviteUsersToEvent, BulkInvitationRow } from "@/lib/actions";
import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";

interface ParsedRow {
  index: number;
  email: string;
  name?: string;
  lastName?: string;
  dni?: string;
  quantity: number;
  valid: boolean;
  error?: string;
}

interface BulkInvitationImportProps {
  evento: Evento;
  soldTickets?: Record<
    string,
    { id?: string; title?: string; count?: number }
  >;
  onSuccess?: () => void;
}

const emailSchema = z.string().email();

function parseCSV(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Detect if first line is a header (contains "email" literally)
  const firstLine = lines[0].toLowerCase();
  const startIndex = firstLine.includes("email") ? 1 : 0;

  return lines.slice(startIndex).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [email = "", name = "", lastName = "", dni = "", quantityRaw = ""] =
      cols;
    const quantity = parseInt(quantityRaw) || 1;

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      return {
        index: i + startIndex + 1,
        email,
        name: name || undefined,
        lastName: lastName || undefined,
        dni: dni || undefined,
        quantity,
        valid: false,
        error: "Email inválido",
      };
    }
    if (quantity < 1 || quantity > 10) {
      return {
        index: i + startIndex + 1,
        email,
        name: name || undefined,
        lastName: lastName || undefined,
        dni: dni || undefined,
        quantity,
        valid: false,
        error: "Cantidad debe ser entre 1 y 10",
      };
    }

    return {
      index: i + startIndex + 1,
      email,
      name: name || undefined,
      lastName: lastName || undefined,
      dni: dni || undefined,
      quantity,
      valid: true,
    };
  });
}

export function BulkInvitationImport({
  evento,
  soldTickets,
  onSuccess,
}: BulkInvitationImportProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [ticketTypeId, setTicketTypeId] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTicketTypes =
    evento.ticketTypes?.filter(
      (t: Partial<TicketType>) =>
        t.status !== "DELETED" && t.status !== "INACTIVE",
    ) ?? [];

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!ticketTypeId) {
      toast({
        title: "Seleccioná un tipo de entrada",
        variant: "destructive",
      });
      return;
    }
    if (validRows.length === 0) {
      toast({ title: "No hay filas válidas para importar", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BulkInvitationRow[] = validRows.map((r) => ({
        email: r.email,
        name: r.name,
        lastName: r.lastName,
        dni: r.dni,
        ticketTypeId,
        quantity: r.quantity,
      }));

      const result = await bulkInviteUsersToEvent(evento.id!, payload);

      if (result.errors.length === 0) {
        toast({
          title: `${result.success} invitaciones creadas`,
          description: "Todas las invitaciones fueron enviadas correctamente.",
        });
      } else {
        toast({
          title: `${result.success} creadas, ${result.errors.length} con errores`,
          description: result.errors
            .slice(0, 3)
            .map((e) => `Fila ${e.row} (${e.email}): ${e.message}`)
            .join(" · "),
          variant: "destructive",
        });
      }

      clearFile();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error al importar",
        description:
          error instanceof Error ? error.message : "Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Ticket type selector */}
      <div className="space-y-1.5">
        <Label>Tipo de entrada</Label>
        <Select value={ticketTypeId} onValueChange={setTicketTypeId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná el tipo de entrada" />
          </SelectTrigger>
          <SelectContent>
            {activeTicketTypes.map((ticket: Partial<TicketType>) => {
              const available =
                ticket.quantity! -
                (soldTickets ? (soldTickets[ticket.id!]?.count ?? 0) : 0);
              return (
                <SelectItem
                  key={ticket.id}
                  value={ticket.id!}
                  disabled={available <= 0}
                >
                  {ticket.title}{" "}
                  <span className="text-muted-foreground">
                    ({available} disponibles)
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* File upload */}
      {!fileName ? (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            Arrastrá un archivo CSV o hacé clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Columnas: email, nombre, apellido, dni, cantidad (solo email
            requerido)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border px-4 py-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{fileName}</span>
            <span className="text-xs text-muted-foreground">
              · {rows.length} fila{rows.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={clearFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            {validRows.length > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {validRows.length} válida{validRows.length !== 1 ? "s" : ""}
              </span>
            )}
            {invalidRows.length > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {invalidRows.length} con error
                {invalidRows.length !== 1 ? "es" : ""}
              </span>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="max-h-52 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">#</th>
                    <th className="text-left px-3 py-2 font-medium">Email</th>
                    <th className="text-left px-3 py-2 font-medium">Nombre</th>
                    <th className="text-left px-3 py-2 font-medium">Cant.</th>
                    <th className="text-left px-3 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.index}
                      className={
                        row.valid ? "bg-background" : "bg-destructive/5"
                      }
                    >
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {row.index}
                      </td>
                      <td className="px-3 py-1.5">{row.email || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">
                        {[row.name, row.lastName].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td className="px-3 py-1.5">{row.quantity}</td>
                      <td className="px-3 py-1.5">
                        {row.valid ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <span className="text-destructive text-xs">
                            {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Solo las filas válidas serán importadas. Las filas con errores serán
            omitidas.
          </p>
        </div>
      )}

      {/* Submit */}
      {validRows.length > 0 && (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !ticketTypeId}
        >
          {isSubmitting
            ? "Importando..."
            : `Importar ${validRows.length} invitación${validRows.length !== 1 ? "es" : ""}`}
        </Button>
      )}

      {/* CSV sample download */}
      <div className="rounded-md bg-muted/50 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium">Formato CSV esperado</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Columnas: email, nombre, apellido, dni, cantidad. Solo email es
            requerido.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => {
            const csv = [
              "email,nombre,apellido,dni,cantidad",
              "juan@gmail.com,Juan,Perez,12345678,2",
              "maria@gmail.com,,,, ",
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "invitaciones-ejemplo.csv";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Descargar ejemplo
        </Button>
      </div>
    </div>
  );
}
