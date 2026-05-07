"use client";

import { unassignPaymentMethodFromEvent } from "@/lib/actions";
import { Plus, PlusIcon, Trash, X } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

type AssignMethodProp = {
  eventId: string;
  paymentMethodId: string;
};

export default function UnassignPaymentMethodButton({
  eventId,
  paymentMethodId,
}: AssignMethodProp) {
  const handleAssign = () => {
    unassignPaymentMethodFromEvent({ eventId, paymentMethodId });
  };

  return (
    <DropdownMenuItem className="text-destructive" onClick={handleAssign}>
      <Trash className="mr-2 h-4 w-4" />
      Quitar del evento
    </DropdownMenuItem>
  );
}
