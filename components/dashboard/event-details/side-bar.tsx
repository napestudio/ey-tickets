import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Evento } from "@/types/event";
import { Percent, Ticket, User } from "lucide-react";

import MinimalEventSalesStats from "../mininimal-event-sales-stats";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DiscountCodeDialog } from "./discount-code-dialog";
import { AddInvitationDialog } from "../add-invitation-dialog";

interface SideBarProps {
  evento: Evento;
  isSeller: boolean;
  isEventOwner: boolean;
  remainingInvites: number;
  remainingTickets: number;
  maxInvitesAmount: number;
  soldTickets: Record<
    string,
    {
      id?: string | undefined;
      title?: string | undefined;
      count?: number | undefined;
    }
  >;
}

export default function SideBar({
  evento,
  isSeller,
  isEventOwner,
  remainingInvites,
  remainingTickets,
  maxInvitesAmount,
  soldTickets,
}: SideBarProps) {
  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: {
        label: "ACTIVO",
        color: "bg-cyan-500/20 text-green-700 hover:bg-green-500/20",
      },
      CONCLUDED: {
        label: "FINALIZADO",
        color: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20",
      },
      CANCELED: {
        label: "CANCELADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },
      DELETED: {
        label: "ELIMINADO",
        color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
      },

      DEFAULT: {
        label: status,
        color: "",
      },
    };

    const { label, color } = statusMap[status] || statusMap.DEFAULT;

    return (
      <Badge className={color} variant="secondary">
        {label}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Detalles del evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {evento.status && (
            <div>
              <h4 className="text-sm font-medium mb-1">Estado</h4>
              {renderStatusBadge(evento.status)}
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-1">Creado por</h4>
            <p className="text-sm">{evento.user?.name}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Dirección</h4>
            <p className="text-sm">
              {evento.address} | {evento.location}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ventas</CardTitle>{" "}
        </CardHeader>
        <CardContent className="space-y-4">
          <MinimalEventSalesStats eventId={evento.id} />
          {/* <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vendidas</span>
                    <span>100 / 1200</span>
                  </div>
    
                  <p className="text-xs text-muted-foreground">
                    90% de tickets vendidos
                  </p>
                </div> */}
        </CardContent>
        <Separator />

        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button
              asChild
              size="sm"
              disabled={evento.status === "CANCELED" || remainingTickets <= 0}
            >
              <Link
                href={`/dashboard/evento/${evento.id}/vender-entrada`}
                className={cn(
                  evento.status === "CANCELED" &&
                    "opacity-50 pointer-events-none"
                )}
              >
                <Ticket className="mr-2 h-4 w-4" />
                Vender entrada
              </Link>
            </Button>
            {maxInvitesAmount > 0 && (
              <AddInvitationDialog
                evento={evento}
                remainingInvites={remainingInvites}
                soldTickets={soldTickets}
                isEventOwner={isEventOwner}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    evento.status === "CANCELED" ||
                    remainingInvites <= 0 ||
                    isSeller
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  Agregar invitado
                </Button>
              </AddInvitationDialog>
            )}
          </div>
        </CardContent>
        {!isSeller && isEventOwner && (
          <>
            <Separator />
            <CardHeader>
              <CardTitle>Promociones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="text-sm font-medium mb-2">Códigos de descuento</h4>
              <div className="grid gap-2 mb-5">
                <DiscountCodeDialog evento={evento}>
                  <Button variant="outline" size="sm">
                    <Percent className="mr-2 h-4 w-4" />
                    Agregar código
                  </Button>
                </DiscountCodeDialog>
              </div>
              {evento.discountCode && evento.discountCode?.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium my-2">Códigos activos</h5>
                  {evento.discountCode.map((code) => (
                    <div key={code.id} className="mb-2">
                      <DiscountCodeDialog evento={evento} code={code}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-left font-bold"
                        >
                          {code.code}
                        </Button>
                      </DiscountCodeDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}
