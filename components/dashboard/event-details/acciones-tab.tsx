"use client";

import { Evento } from "@/types/event";
import { Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscountCodeDialog } from "./discount-code-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AccionesTabProps {
  evento: Evento;
}

export default function AccionesTab({ evento }: AccionesTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Códigos de descuento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <DiscountCodeDialog evento={evento}>
              <Button variant="outline" size="sm" className="w-fit">
                <Percent className="mr-2 h-4 w-4" />
                Agregar código
              </Button>
            </DiscountCodeDialog>
          </div>
          {evento.discountCode && evento.discountCode.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h5 className="text-sm font-medium mb-3">Códigos activos</h5>
              <div className="grid gap-2 sm:grid-cols-2">
                {evento.discountCode.map((code) => (
                  <DiscountCodeDialog
                    key={code.id}
                    evento={evento}
                    code={code}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-left font-bold"
                    >
                      {code.code}
                    </Button>
                  </DiscountCodeDialog>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
