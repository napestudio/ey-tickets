"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TicketOrderType } from "@/types/tickets";
import { ColumnDef } from "@tanstack/react-table";
import { invalidateTicketById, validateTicketById } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

function StatusSwitch({
  status,
  id,
  eventId,
  sessionId,
  updateData,
  type = "VALIDADOR",
}: {
  status: string;
  id: string;
  eventId: string;
  sessionId: string;
  updateData: () => void;
  type?: "ESTADISTICAS" | "VALIDADOR";
}) {
  const [isValidated, setIsValidated] = useState(status === "VALIDATED");

  useEffect(() => {
    setIsValidated(status === "VALIDATED");
  }, [status]);

  async function changeStatus() {
    const newStatus = !isValidated;
    setIsValidated(newStatus);

    try {
      if (newStatus) {
        const r = await validateTicketById(id, eventId, sessionId);
        if (r.success) {
          updateData();
          toast({ title: "Ticket validado" });
        } else if (r.alreadyValidated) {
          setIsValidated(true);
          toast({
            title: "El ticket ya fue validado con anterioridad",
            variant: "destructive",
          });
        }
      } else {
        const r = await invalidateTicketById(id, sessionId);
        if (r.success) {
          updateData();
          toast({ title: "Ticket invalidado" });
        } else {
          setIsValidated(true);
          toast({
            title: "No se pudo invalidar el ticket",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "TICKET NO VÁLIDO",
        variant: "destructive",
      });
      setIsValidated(!newStatus);
    }
  }

  return (
    <div className="text-right font-medium">
      <Switch checked={isValidated} onCheckedChange={changeStatus} />
    </div>
  );
}

export const getColumns = (
  type?: "ESTADISTICAS" | "VALIDADOR",
  sessionId?: string,
  showSessionValidatedAt?: boolean,
): ColumnDef<Partial<TicketOrderType>>[] => {
  const columns: ColumnDef<Partial<TicketOrderType>>[] = [
    ...(type === "VALIDADOR" && sessionId && !showSessionValidatedAt
      ? [
          {
            accessorKey: "status",
            header: () => <div className="text-right">Estado</div>,
            // @ts-ignore
            cell: ({ row, table }) => (
              <StatusSwitch
                status={row.original.status!}
                id={row.original.id!}
                eventId={row.original.eventId!}
                sessionId={sessionId}
                // @ts-ignore
                updateData={table.options.meta!.updateData}
              />
            ),
          },
        ]
      : []),
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ row }) => {
        const code = row.original.code;
        return code != null ? String(code).padStart(6, "0") : "-";
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <p>
            {row.original.name} {row.original.lastName}
          </p>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "dni",
      header: "DNI",
    },
    ...(showSessionValidatedAt
      ? [
          {
            accessorKey: "sessionValidatedAt",
            header: "Hora de validación",
            cell: ({ row }: { row: { original: Partial<TicketOrderType> & { sessionValidatedAt?: Date | null } } }) => {
              const date = row.original.sessionValidatedAt;
              if (!date) return "-";
              return new Intl.DateTimeFormat("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(date));
            },
          },
        ]
      : []),
  ];

  return columns;
};
