"use client";

import { cn } from "@/lib/utils";
import { Evento } from "@/types/event";
import { Percent, Ticket, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DiscountCodeDialog } from "./discount-code-dialog";
import { AddInvitationDialog } from "../add-invitation-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AccionesTabProps {
  evento: Evento;
  isSeller: boolean;
  isEventOwner: boolean;
  hasAllocation: boolean;
  soldTickets: Record<
    string,
    {
      id?: string | undefined;
      title?: string | undefined;
      count?: number | undefined;
    }
  >;
}

export default function AccionesTab({
  evento,
  isSeller,
  isEventOwner,
  hasAllocation,
  soldTickets,
}: AccionesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              asChild
              size="sm"
              disabled={evento.status === "CANCELED" || !hasAllocation}
            >
              <Link
                href={`/dashboard/evento/${evento.id}/vender-entrada`}
                className={cn(
                  evento.status === "CANCELED" &&
                    "opacity-50 pointer-events-none",
                )}
              >
                <Ticket className="mr-2 h-4 w-4" />
                Vender entrada
              </Link>
            </Button>

            <AddInvitationDialog
              evento={evento}
              soldTickets={soldTickets}
              isEventOwner={isEventOwner}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={evento.status === "CANCELED" || isSeller}
              >
                <User className="mr-2 h-4 w-4" />
                Agregar invitado
              </Button>
            </AddInvitationDialog>
            {/* )} */}
          </div>
        </CardContent>
      </Card>

      {!isSeller && isEventOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Promociones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="text-sm font-medium">Códigos de descuento</h4>
            <div className="grid gap-2">
              <DiscountCodeDialog evento={evento}>
                <Button variant="outline" size="sm" className="w-fit">
                  <Percent className="mr-2 h-4 w-4" />
                  Agregar código
                </Button>
              </DiscountCodeDialog>
            </div>
            {evento.discountCode && evento.discountCode.length > 0 && (
              <div>
                <Separator className="my-4" />
                <h5 className="text-sm font-medium mb-3">Códigos activos</h5>
                <div className="grid gap-2 sm:grid-cols-2">
                  {evento.discountCode.map((code) => (
                    <DiscountCodeDialog
                      key={code.id}
                      evento={evento}
                      code={code}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-left font-bold"
                      >
                        {code.code}
                      </Button>
                    </DiscountCodeDialog>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
