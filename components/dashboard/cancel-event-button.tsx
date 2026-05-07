"use client";
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

import { Button } from "../ui/button";

import { cancelEvent, updateEvent } from "@/lib/actions";
import { X } from "lucide-react";

type AlertRemoveType = {
  id: string;
};

export default function CancelEventButton({ id }: AlertRemoveType) {
  const handleCancel = () => {
    cancelEvent(id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <X className="mr-2 h-4 w-4" />
          Cancelar Evento
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Evento</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cancelará el evento y no se podrá deshacer. ¿Estás
            seguro de que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4 items-center">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>
            Cancelar evento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
