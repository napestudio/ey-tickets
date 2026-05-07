import { TicketTypeStatus } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
interface AlertProps {
  action: (status: TicketTypeStatus) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  method: TicketTypeStatus;
}
export default function UpdateTicketTypeStatus({
  action,
  open,
  onOpenChange,
  method,
}: AlertProps) {
  let actionMethod = "";

  switch (method) {
    case "ACTIVE":
      actionMethod = "Activar";
      break;
    case "DELETED":
      actionMethod = "Eliminar";
      break;
    case "INACTIVE":
      actionMethod = "Pausar";
      break;
    default:
      actionMethod = "Activar";
      break;
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionMethod} método de pago?</AlertDialogTitle>
          <AlertDialogDescription>
            {method === "DELETED" && (
              <>
                Esto elimina el tipo de ticket y toda la información asociada.
                Esta acción no se puede revertir.
              </>
            )}
            {method === "INACTIVE" && (
              <>
                Esto desactiva el tipo de ticket para su venta, los clientes
                pueden seguir viendolo pero no podrán seleccionarlo.
                <br />
                Esta acción se puede revertir en cualquier momento.
              </>
            )}
            {method === "ACTIVE" && (
              <>
                Esto volverá a activar el tipo de ticket para su venta, los
                clientes podrán volver a comprarlos.
                <br />
                Esta acción se puede revertir en cualquier momento.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4 items-center">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => action(method)}>
            {actionMethod}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
