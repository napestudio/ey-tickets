"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Landmark, CreditCard, Banknote } from "lucide-react";
import Box from "@/components/dashboard/box";
import { useToast } from "@/components/ui/use-toast";
import {
  getPaymentMethodsByProducerId,
  assignPaymentMethodsToEvent,
  unassignPaymentMethodFromEvent,
} from "@/lib/actions";

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
  eventId: string;
  producerId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function Step7PaymentMethods({
  eventId,
  producerId,
  onComplete,
  onSkip,
}: Step7PaymentMethodsProps) {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
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

  async function handleToggle(method: PaymentMethod) {
    const isAssigned = assignedIds.has(method.id);
    setLoadingIds((prev) => new Set([...prev, method.id]));

    try {
      if (isAssigned) {
        await unassignPaymentMethodFromEvent({ eventId, paymentMethodId: method.id });
        setAssignedIds((prev) => {
          const next = new Set(prev);
          next.delete(method.id);
          return next;
        });
      } else {
        await assignPaymentMethodsToEvent({ eventId, paymentMethodIds: [method.id] });
        setAssignedIds((prev) => new Set([...prev, method.id]));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: isAssigned ? "Error quitando método de pago" : "Error asignando método de pago",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(method.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-5">
      <Box>
        <div className="space-y-4">
          <div>
            <h2 className="font-bold">Métodos de pago</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Seleccioná los métodos de pago habilitados para este evento.
            </p>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No tenés métodos de pago configurados.{" "}
              <span className="block mt-1">
                Podés agregarlos desde{" "}
                <span className="font-medium">Configuración → Métodos de pago</span>.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {methods.map((method) => {
                const isAssigned = assignedIds.has(method.id);
                const isLoading = loadingIds.has(method.id);

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handleToggle(method)}
                    disabled={isLoading}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      isAssigned
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
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                    ) : (
                      <div
                        className={`h-5 w-5 rounded-full border-2 shrink-0 transition-colors ${
                          isAssigned
                            ? "bg-ey-turquoise border-ey-turquoise"
                            : "border-muted-foreground/40"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Box>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onSkip}>
          Saltar
        </Button>
        <Button type="button" onClick={onComplete}>
          Finalizar
        </Button>
      </div>
    </div>
  );
}
