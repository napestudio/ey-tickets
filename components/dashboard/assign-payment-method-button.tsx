"use client";

import {
  assignPaymentMethodsToEvent,
  deletePaymentMethod,
} from "@/lib/actions";

import { DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "../ui/use-toast";
import { Plus } from "lucide-react";

type AssignMethodProp = {
  eventId: string;
  paymentMethodIds: string[];
};

export default function AssignPaymentMethodButton({
  eventId,
  paymentMethodIds,
}: AssignMethodProp) {
  const handleAssign = async () => {
    try {
      const result = await assignPaymentMethodsToEvent({
        eventId,
        paymentMethodIds,
      });
      if ("error" in result) {
        toast({
          variant: "destructive",
          title: "Error eliminando método",
          description: String(result.error),
        });
        return;
      }
      toast({
        title: "Método asignado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: (error as Error).message || "No se pudo asignar",
      });
    }
  };

  return (
    <DropdownMenuItem onClick={handleAssign}>
      <Plus className="h-4 w-4 mr-2" /> Asignar
    </DropdownMenuItem>
  );
}
