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
import { ReactNode } from "react";

type AlertRemoveType = {
  action: (id: string) => void;
  text: string;
  title: string;
  actionText: string;
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CancelInvitationAlert({
  action,
  text,
  title,
  actionText,
  id,
  open,
  onOpenChange,
}: AlertRemoveType) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4 items-center">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cerrar
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => action(id)}>
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
