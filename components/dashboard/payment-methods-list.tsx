"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EventPayment, PaymentMethod } from "@prisma/client";
import UnassignPaymentMethodButton from "./unassign-payment-method";
import { cn } from "@/lib/utils";
// import { EditPaymentMethodDialog } from "./edit-payment-method-dialog"

export default function PaymentMethodsList({ methods }: { methods: any[] }) {
  const renderTypeBadge = (type: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      CASH: {
        label: "Punto de venta",
        color: "bg-green text-white",
      },
      DIGITAL: {
        label: "MercadoPago",
        color: "bg-blue text-white",
      },
      DEFAULT: {
        label: type,
        color: "",
      },
    };

    const { label, color } = statusMap[type] || statusMap.DEFAULT;

    return (
      <Badge className={cn(color, "whitespace-nowrap")} variant="secondary">
        {label}
      </Badge>
    );
  };
  return (
    <Card className="max-w-[100vw] overflow-hidden">
      <CardHeader>
        <CardTitle>Métodos de Pago asignados</CardTitle>
        <CardDescription>
          Listado de los métodos de pago del evento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método de pago</TableHead>
                <TableHead>Tipo</TableHead>

                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {method.paymentMethod.type === "DIGITAL" && (
                        <div className="h-10 w-10 flex text-white items-center justify-center bg-blue rounded-md overflow-hidden">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
                            <path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                            <path d="m2 13 6 6" />
                          </svg>
                        </div>
                      )}
                      {method.paymentMethod.type === "CASH" && (
                        <div className="h-10 w-10 flex items-center justify-center bg-green text-white bg-opacity-10 rounded-md overflow-hidden">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                            <path d="M12 18V6" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {method.paymentMethod.name}
                        </div>
                        {method.paymentMethod.apiKey && (
                          <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {method.paymentMethod.apiKey}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderTypeBadge(method.paymentMethod.type)}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <UnassignPaymentMethodButton
                          eventId={method.eventId}
                          paymentMethodId={method.paymentMethod.id}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* {selectedPaymentMethod && (
        <EditPaymentMethodDialog
          paymentMethod={selectedPaymentMethod}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSavePaymentMethod}
        />
      )} */}
    </Card>
  );
}
