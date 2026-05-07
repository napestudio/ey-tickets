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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { deleteTokenById } from "@/lib/actions";
import { ValidatorToken } from "@/types/validators";
import { TrashIcon } from "lucide-react";
import AlertRemove from "../alert-remove/alert-remove";

export default function TokensCard({ token }: { token: ValidatorToken }) {
  const handleDeleteToken = () => {
    deleteTokenById(token.id)
      .then(() => {
        toast({
          title: "Token de validación eliminado",
        });
      })
      .catch((error: string) => {
        toast({
          variant: "destructive",
          title: "Error eliminando el token de validación",
        });
      });
  };

  const handleCopyToken = () => {
    navigator.clipboard
      .writeText(token.token)
      .then(() => {
        toast({
          title: "Token copiado al portapapeles",
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error copiando el token",
        });
      });
  };

  return (
    <Card className="px-3 w-72 flex flex-col">
      <CardHeader className="pt-6">
        <CardTitle
          onClick={handleCopyToken}
          className="text-4xl font-semibold cursor-pointer"
        >
          {token.token}
        </CardTitle>
        <CardDescription className="md:hidden">Tap para copiar</CardDescription>
        <CardDescription className="hidden md:block">
          Click para copiar
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex shrink-0">
        <AlertRemove
          text="Está acción no se puede revertir. El token de validación se eliminará permanentemente."
          action={handleDeleteToken}
        >
          <Button className="w-full" size="icon" variant="destructive">
            <TrashIcon className="w-6 h-6" /> Eliminar
          </Button>
        </AlertRemove>
      </CardFooter>
    </Card>
  );
}
