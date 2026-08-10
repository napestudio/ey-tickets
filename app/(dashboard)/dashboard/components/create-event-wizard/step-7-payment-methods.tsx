"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Landmark, CreditCard, Banknote, Plus } from "lucide-react";
import Box from "@/components/dashboard/box";
import { useToast } from "@/components/ui/use-toast";
import { getPaymentMethodsByProducerId } from "@/lib/actions";

type PaymentType = "CASH" | "DIGITAL" | "TRANSFER";

type PaymentMethod = {
  id: string;
  type: PaymentType;
  name: string | null;
  apiKey: string | null;
  cbu: string | null;
  alias: string | null;
  enabled: boolean;
};

const TYPE_LABELS: Record<PaymentType, string> = {
  CASH: "Punto de venta",
  DIGITAL: "MercadoPago",
  TRANSFER: "Transferencia",
};

const TYPE_COLORS: Record<PaymentType, string> = {
  CASH: "bg-green-500",
  DIGITAL: "bg-blue-500",
  TRANSFER: "bg-amber-500",
};

function PaymentMethodIcon({ type }: { type: PaymentType }) {
  const base = `h-9 w-9 flex items-center justify-center rounded-md text-white shrink-0 ${TYPE_COLORS[type]}`;
  if (type === "DIGITAL") {
    return (
      <div className={base}>
        <CreditCard className="h-5 w-5" />
      </div>
    );
  }
  if (type === "CASH") {
    return (
      <div className={base}>
        <Banknote className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className={base}>
      <Landmark className="h-5 w-5" />
    </div>
  );
}

interface Step7PaymentMethodsProps {
  producerId: string;
  isLoading: boolean;
  onComplete: (selectedMethodIds: string[]) => void;
  onBack: () => void;
}

export function Step7PaymentMethods({
  producerId,
  isLoading,
  onComplete,
  onBack,
}: Step7PaymentMethodsProps) {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    getPaymentMethodsByProducerId(producerId)
      .then((data) => {
        setMethods((data ?? []) as PaymentMethod[]);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error cargando métodos de pago",
        });
      })
      .finally(() => setIsFetching(false));
  }, [producerId, toast]);

  function toggleMethod(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <Box>
        <div className="space-y-4">
          <div>
            <h2 className="font-bold">Métodos de pago</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Seleccioná los métodos de pago habilitados para este evento. Podés modificarlos después.
            </p>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                No tenés métodos de pago configurados.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/configuracion/metodos-de-pago" target="_blank">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar método de pago
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Se abrirá en una nueva pestaña. Volvé aquí una vez que lo hayas configurado.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {methods.map((method) => {
                const isSelected = selectedIds.has(method.id);

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => toggleMethod(method.id)}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-ey-turquoise bg-ey-turquoise/5"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <PaymentMethodIcon type={method.type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {method.name ?? TYPE_LABELS[method.type]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {TYPE_LABELS[method.type]}
                        {method.alias && ` · ${method.alias}`}
                        {method.cbu && ` · CBU: ${method.cbu}`}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 shrink-0 transition-colors ${
                        isSelected
                          ? "bg-ey-turquoise border-ey-turquoise"
                          : "border-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Box>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Volver
        </Button>
        <Button
          type="button"
          onClick={() => onComplete(Array.from(selectedIds))}
          disabled={isLoading || isFetching}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando evento...
            </>
          ) : (
            "Crear evento"
          )}
        </Button>
      </div>
    </div>
  );
}
