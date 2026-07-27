"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Box from "@/components/dashboard/box";
import { useToast } from "@/components/ui/use-toast";
import { createTicketType, getRemainingTicketsForEvent } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DateTimeSelection } from "./types";

const FALLBACK_MAX = 999999;

const step4Schema = z.object({
  title: z.string().min(1, { message: "El titulo es obligatorio." }),
  price: z.number().min(0),
  quantity: z.number().int().min(1, { message: "La cantidad debe ser mayor a 0." }),
  isFree: z.boolean().default(false),
  selectedDates: z
    .array(z.string())
    .min(1, { message: "Seleccioná al menos una fecha." }),
});

type Step4Schema = z.infer<typeof step4Schema>;

interface Step4TicketTypeProps {
  eventId: string;
  producerId: string;
  eventDates: DateTimeSelection[];
  onComplete: () => void;
  onSkip: () => void;
}

export function Step4TicketType({
  eventId,
  producerId,
  eventDates,
  onComplete,
  onSkip,
}: Step4TicketTypeProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTickets, setRemainingTickets] = useState<number>(FALLBACK_MAX);

  useEffect(() => {
    getRemainingTicketsForEvent(eventId, producerId)
      .then((result) => setRemainingTickets(result ?? FALLBACK_MAX))
      .catch(() => setRemainingTickets(FALLBACK_MAX));
  }, [eventId, producerId]);

  const form = useForm<Step4Schema>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      title: "",
      price: 0,
      quantity: 0,
      isFree: false,
      selectedDates: eventDates.map((d) => d.date),
    },
  });

  const isFree = form.watch("isFree");

  function formatDateLabel(dateStr: string): string {
    try {
      const parsed = parseISO(dateStr);
      return format(parsed, "EEEE d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return dateStr;
    }
  }

  async function onSubmit(values: Step4Schema) {
    if (values.quantity > remainingTickets) {
      form.setError("quantity", {
        message: `No podés crear más de ${remainingTickets} tickets.`,
      });
      return;
    }

    setIsLoading(true);
    const formatedDates = values.selectedDates.map((date, index) => ({
      id: index,
      date,
    }));

    try {
      await createTicketType({
        title: values.title,
        description: null,
        price: values.isFree ? 0 : values.price,
        dates: JSON.stringify(formatedDates),
        quantity: values.quantity,
        status: "ACTIVE",
        eventId,
        position: 0,
        discount: 0,
        buyGet: 0,
        limitPerSale: 10,
        type: "NORMAL",
        isFree: values.isFree,
      });
      toast({ title: "Tipo de ticket creado!" });
      onComplete();
    } catch {
      toast({
        variant: "destructive",
        title: "Error al crear el tipo de ticket",
        description: "Podés intentarlo de nuevo o usar el panel del evento.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Box>
        <div className="space-y-4">
          <h2 className="font-bold">Crear tipo de entrada</h2>
          <p className="text-sm text-muted-foreground">
            Podés agregar el primer tipo de entrada ahora o hacerlo después
            desde el panel del evento.
          </p>
          {remainingTickets < FALLBACK_MAX && (
            <p className="text-xs text-muted-foreground">
              Capacidad disponible: <strong>{remainingTickets}</strong> tickets.
            </p>
          )}
        </div>
      </Box>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Box>
            <div className="space-y-4">
              <h3 className="font-semibold">Información básica</h3>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la entrada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: General, VIP, Estudiantes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>Entrada gratuita</Label>
                    </FormItem>
                  )}
                />
              </div>

              {!isFree && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de tickets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Box>

          <Box>
            <div className="space-y-4">
              <h3 className="font-semibold">Fechas disponibles</h3>
              <FormField
                control={form.control}
                name="selectedDates"
                render={() => (
                  <FormItem>
                    <div className="space-y-2">
                      {eventDates.map((dateEntry) => (
                        <FormField
                          key={dateEntry.id}
                          control={form.control}
                          name="selectedDates"
                          render={({ field }) => (
                            <FormItem
                              key={dateEntry.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dateEntry.date)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    if (checked) {
                                      field.onChange([...current, dateEntry.date]);
                                    } else {
                                      field.onChange(
                                        current.filter((d) => d !== dateEntry.date)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {formatDateLabel(dateEntry.date)}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Box>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              disabled={isLoading}
            >
              Omitir por ahora
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear entrada y finalizar"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
