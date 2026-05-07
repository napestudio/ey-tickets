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

import { cancelEvent, deleteEvent, updateEvent } from "@/lib/actions";
import { AlertCircle, Trash, X } from "lucide-react";
import { redirect } from "next/navigation";

type AlertRemoveType = {
  id: string;
  hasSoldTickets?: boolean;
};

export default function DeleteEventButton({
  id,
  hasSoldTickets,
}: AlertRemoveType) {
  const handleDelete = () => {
    deleteEvent(id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="mr-2 h-4 w-4" />
          Eliminar Evento
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
          <AlertDialogDescription>
            {hasSoldTickets && (
              <>
                <AlertCircle /> Este evento tiene tickets vendidos.
              </>
            )}
            Esta acción elimina el evento y todos los datos asociados al mismo.
            Esta acción no se podrá deshacer. ¿Estás seguro de que deseas
            continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4 items-center">
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Eliminar definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
