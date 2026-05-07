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

import { PaymentMethod } from "@prisma/client";
import AssignPaymentMethodButton from "./assign-payment-method-button";
import { EditPaymentMethodDialog } from "./edit-payment-method-dialog";
import { User } from "@/types/user";
import { deletePaymentMethod } from "@/lib/actions";
import { toast } from "../ui/use-toast";
import RemovePaymentMethodAlert from "./remove-payment-method-alert";
import { Session } from "next-auth";
import { cn } from "@/lib/utils";
// import { EditPaymentMethodDialog } from "./edit-payment-method-dialog"

export default function PaymentMethodsTable({
  sellers,
  eventId,
  methods,
}: {
  sellers?: User[];
  eventId?: string;
  methods: PaymentMethod[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>();

  const handleEditSettings = (paymentMethod: PaymentMethod) => {
    setSelectedMethod(paymentMethod);
    setIsEditDialogOpen(true);
  };

  const handleOpenAlert = (paymentMethod: PaymentMethod) => {
    setSelectedMethod(paymentMethod);
    setIsAlertDialogOpen(true);
  };

  const handleRemoveMethod = async () => {
    if (!selectedMethod) return;

    try {
      const result = await deletePaymentMethod(selectedMethod.id);

      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Error eliminando método",
          description: result.error,
        });
        return;
      }

      toast({
        title: "Método eliminado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: (error as Error).message || "No se pudo eliminar",
      });
    }
  };

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

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case true:
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Activo
          </Badge>
        );
      case false:
        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-700">
            Inactivo
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago {eventId ? "disponibles" : ""}</CardTitle>
        <CardDescription>
          {eventId && (
            <>
              Asigna métodos de pago a este evento. No se puede asignar más de
              un método de pago digital por evento.
            </>
          )}
          {!eventId && <>Listado de los métodos de pago de la plataforma.</>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar método..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div> */}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método de pago</TableHead>
                <TableHead>Tipo</TableHead>
                {!eventId && <TableHead>Estado</TableHead>}

                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {method.type === "DIGITAL" && (
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
                      {method.type === "CASH" && (
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
                        <div className="font-medium">{method.name}</div>
                        {method.apiKey && (
                          <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {method.apiKey}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{renderTypeBadge(method.type)}</TableCell>
                  {!eventId && (
                    <TableCell>{getStatusBadge(method.enabled)}</TableCell>
                  )}

                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        {eventId && (
                          // <DropdownMenuItem>
                          <AssignPaymentMethodButton
                            eventId={eventId}
                            paymentMethodIds={[method.id]}
                          />
                          // </DropdownMenuItem>
                        )}
                        {!eventId && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                handleEditSettings(method);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                handleOpenAlert(method);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {selectedMethod && isEditDialogOpen && (
        <EditPaymentMethodDialog
          paymentMethod={selectedMethod}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          sellers={sellers}
        />
      )}

      {selectedMethod && isAlertDialogOpen && (
        <RemovePaymentMethodAlert
          open={isAlertDialogOpen}
          onOpenChange={setIsAlertDialogOpen}
          action={handleRemoveMethod}
        />
      )}
    </Card>
  );
}
