import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
interface AlertProps {
  action: () => void;
  // onOpenChange: (open: boolean) => void;
  // open: boolean;
}
export default function RemoveDiscountCodeAlert({
  action,
}: // open,
// onOpenChange,
AlertProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="bg-red-500 p-2 rounded-md text-white">
          <Trash />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Código de descuento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción elimina el código de descuento. Ya no será posible que
            se utilice por los clientes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4 items-center">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={action}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
