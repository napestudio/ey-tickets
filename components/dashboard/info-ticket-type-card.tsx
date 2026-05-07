"use client";
import {
  Edit,
  MoreHorizontal,
  Pause,
  PauseCircle,
  Play,
  Trash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TicketType } from "@/types/tickets";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";
import { getStats, updateTicketType } from "@/lib/actions";
import UpdateTicketTypeStatus from "./uptdate-status-ticketType-alert";
import { toast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { Progress } from "../ui/progress";
import { TicketTypeStatus } from "@prisma/client";

export default function InfoTicketTypeCard({ ticket }: { ticket: TicketType }) {
  //   const soldPercentage = Math.round((ticket.sold / ticket.total) * 100)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<TicketTypeStatus>("DELETED");
  const [stats, setStats] = useState<any>();
  const ticketTypeId = ticket.id;

  const fetchData = useCallback(async () => {
    const res = await getStats({ ticketTypeId: ticketTypeId });
    const soldPercentage = Math.round((res.totalSold / ticket.quantity) * 100);
    const data = {
      quantity: ticket.quantity,
      soldPercentage: soldPercentage,
      ...res,
    };
    setStats(data);
  }, [ticketTypeId, ticket.quantity]);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  const handleCancelTicketType = () => {
    setStatus("INACTIVE" as TicketTypeStatus);
    setIsAlertDialogOpen(true);
  };
  const handleDeleteTicketType = () => {
    setStatus("DELETED" as TicketTypeStatus);
    setIsAlertDialogOpen(true);
  };
  const handleActivateTicketType = () => {
    setStatus("ACTIVE" as TicketTypeStatus);
    setIsAlertDialogOpen(true);
  };

  function handleUpdateTicketStatus(method: TicketTypeStatus) {
    const data: Partial<TicketType> = {
      status: method,
    };
    let msg = "";

    switch (method) {
      case "ACTIVE":
        msg = "Tipo de ticket activado correctamente";
        break;
      case "DELETED":
        msg = "Tipo de ticket eliminado";
        break;
      case "INACTIVE":
        msg = "Tipo de ticket pausado correctamente";
        break;
      default:
        msg = "Tipo de ticket activado correctamente";
        break;
    }
    try {
      updateTicketType(data, ticket.id as string);
      toast({
        title: msg,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al editar el estado del tipo de ticket!",
      });
    }
  }

  if (!ticket || !ticket.id) return;

  return (
    <>
      <Card className={cn(ticket.status === "INACTIVE" && "bg-gray-50")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex gap-2">
                {ticket.status === "INACTIVE" && (
                  <Pause className="text-orange-500" />
                )}
                <h3 className="font-medium">{ticket.title}</h3>
              </div>
              <p className="text-2xl font-bold">
                ${ticket.price.toLocaleString("es-ar")}
              </p>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <Link
                    href={`/dashboard/evento/${ticket.eventId}/edit?tab=tickets`}
                  >
                    Editar ticket
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {ticket.status === "INACTIVE" && (
                  <DropdownMenuItem onClick={handleActivateTicketType}>
                    <Play className="mr-2 h-4 w-4" />
                    Continuar ventas
                  </DropdownMenuItem>
                )}
                {ticket.status === "ACTIVE" && (
                  <DropdownMenuItem onClick={handleCancelTicketType}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar ventas
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDeleteTicketType}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <>
              <div className="flex justify-between gap-5 text-sm">
                <span>Vendidas</span>

                <span>
                  {stats?.totalSold | 0} / {ticket.quantity}
                </span>
              </div>

              <Progress value={stats?.soldPercentage | 0} className="h-2" />

              <p className="text-xs text-muted-foreground">
                {stats?.soldPercentage | 0}% vendido
              </p>
            </>
          </div>
        </CardContent>
      </Card>
      {isAlertDialogOpen && (
        <UpdateTicketTypeStatus
          open={isAlertDialogOpen}
          onOpenChange={setIsAlertDialogOpen}
          action={handleUpdateTicketStatus}
          method={status}
        />
      )}
    </>
  );
}
