"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

type Props = {
  status: "success" | "pending" | "unknown" | null;
};

export default function StockPaymentAlert({ status }: Props) {
  if (!status) return null;

  if (status === "success") {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300">
        <CheckCircle2 className="h-4 w-4 !text-green-600" />
        <AlertTitle>Pago aprobado</AlertTitle>
        <AlertDescription>
          Tu paquete de tickets fue acreditado correctamente. El stock ya está
          disponible en tu pool.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "pending") {
    return (
      <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
        <Clock className="h-4 w-4 !text-yellow-600" />
        <AlertTitle>Pago pendiente</AlertTitle>
        <AlertDescription>
          El pago está siendo procesado. El stock se acreditará automáticamente
          cuando se confirme.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
