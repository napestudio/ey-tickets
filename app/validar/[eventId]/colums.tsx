"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TicketOrderType } from "@/types/tickets";
import { ColumnDef } from "@tanstack/react-table";
import { invalidateTicketById, validateTicketById } from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import path from "path";
import { usePathname } from "next/navigation";

function StatusSwitch({
  status,
  id,
  eventId,
  updateData,
  type = "VALIDADOR",
}: {
  status: string;
  id: string;
  eventId: string;
  updateData: () => void;
  type?: "ESTADISTICAS" | "VALIDADOR";
}) {
  const [isValidated, setIsValidated] = useState(status === "VALIDATED");
  const pathname = usePathname();

  useEffect(() => {
    setIsValidated(status === "VALIDATED");
  }, [status]);

  async function changeStatus() {
    const newStatus = !isValidated;
    setIsValidated(newStatus);

    try {
      if (newStatus) {
        // Si el switch cambia a true, valida el ticket
        const r = await validateTicketById(id, eventId);
        if (r !== false) {
          updateData();
          toast({
            title: "Ticket validado",
          });
        } else {
          setIsValidated(true);
          toast({
            title: "El ticket ya fue validado con anterioridad",
            variant: "destructive",
          });
        }
      } else {
        await invalidateTicketById(id);
        updateData();
        toast({
          title: "Ticket invalidado",
        });
      }
    } catch (error) {
      toast({
        title: "TICKET NO VALIDO",
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
  type?: "ESTADISTICAS" | "VALIDADOR"
): ColumnDef<Partial<TicketOrderType>>[] => {
  const columns: ColumnDef<Partial<TicketOrderType>>[] = [
    ...(type === "VALIDADOR"
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
                // @ts-ignore
                updateData={table.options.meta!.updateData}
              />
            ),
          },
        ]
      : []),
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
  ];

  return columns;
};

// export const columns: ColumnDef<Partial<TicketOrderType>>[] = [
//   {
//     accessorKey: "status",
//     header: () => <div className="text-right">Estado</div>,
//     cell: ({ row, table }) => (
//       <StatusSwitch
//         status={row.original.status!}
//         id={row.original.id!}
//         eventId={row.original.eventId!}
//         // @ts-ignore
//         updateData={table.options.meta!.updateData}
//       />
//     ),
//   },
//   {
//     accessorKey: "name",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Nombre
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       );
//     },
//     cell: ({ row }) => {
//       return (
//         <p>
//           {row.original.name} {row.original.lastName}
//         </p>
//       );
//     },
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//   },
//   {
//     accessorKey: "dni",
//     header: "DNI",
//   },
// ];
