"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MercadoPagoForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>MercadoPago</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Los tokens de acceso de MercadoPago ahora se configuran en la sección
          de Métodos de Pago.
        </p>
      </CardContent>
    </Card>
  );
}
