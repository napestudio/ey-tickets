"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { assignEventAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Minus, Plus } from "lucide-react";

interface EventOption {
  id: string;
  title: string;
}

interface ExistingAllocation {
  eventId: string;
  eventTitle: string;
  quantity: number;
  ticketTypesQuantity: number;
}

interface AssignEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
  availableStock: number;
  events: EventOption[];
  existingAllocation?: ExistingAllocation;
}

export default function AssignEventDialog({
  open,
  onOpenChange,
  producerId,
  availableStock,
  events,
  existingAllocation,
}: AssignEventDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isEditing = !!existingAllocation;

  // In create mode: quantity = total to set. In edit mode: delta = amount to ADD.
  const maxDelta = availableStock;
  const [delta, setDelta] = useState(1);

  useEffect(() => {
    if (open) setDelta(1);
  }, [open]);

  const newTotal = isEditing ? existingAllocation.quantity + delta : delta;

  const schema = z.object({
    eventId: z.string().min(1, "Seleccioná un evento"),
    delta: z
      .number({ invalid_type_error: "Ingresá una cantidad válida" })
      .min(1, "Debe ser al menos 1")
      .max(maxDelta, `Máximo disponible del pool: ${maxDelta}`),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: existingAllocation?.eventId ?? "",
      delta: 1,
    },
  });

  useEffect(() => {
    form.setValue("delta", delta, { shouldValidate: true });
  }, [delta, form]);

  function handleClose(v: boolean) {
    if (!v) {
      setDelta(1);
      form.reset({ eventId: existingAllocation?.eventId ?? "", delta: 1 });
    }
    onOpenChange(v);
  }

  const decrement = () => setDelta((p) => Math.max(1, p - 1));
  const increment = () => setDelta((p) => Math.min(maxDelta, p + 1));
  const addQuick = (n: number) => setDelta((p) => Math.min(maxDelta, p + n));

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const quantity = isEditing
          ? existingAllocation.quantity + values.delta
          : values.delta;
        await assignEventAllocationAction(producerId, values.eventId, quantity);
        toast({
          title: isEditing ? "Tickets agregados" : "Asignación creada",
          description: `Se asignaron ${values.delta} tickets al evento.`,
        });
        handleClose(false);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : "No se pudo guardar la asignación.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Agregar tickets al evento" : "Asignar tickets a evento"}
          </DialogTitle>
          {isEditing && (
            <DialogDescription>{existingAllocation.eventTitle}</DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Estado actual — solo en edición */}
            {isEditing && (
              <div className="rounded-md border bg-muted/40 p-3 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Asignados actualmente</p>
                  <p className="font-semibold">
                    {existingAllocation.quantity.toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Disponible en el pool</p>
                  <p className="font-semibold">{availableStock.toLocaleString("es-AR")}</p>
                </div>
              </div>
            )}

            {/* Selector de evento — solo en creación */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná un evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {events.map((ev) => (
                          <SelectItem key={ev.id} value={ev.id}>
                            {ev.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Stepper de cantidad a agregar */}
            <FormField
              control={form.control}
              name="delta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Tickets a agregar" : "Tickets a asignar"}
                  </FormLabel>
                  <FormControl>
                    <input type="hidden" {...field} value={delta} />
                  </FormControl>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={decrement}
                        disabled={delta <= 1 || isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-16 text-center text-lg font-semibold tabular-nums">
                        {delta.toLocaleString("es-AR")}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={increment}
                        disabled={delta >= maxDelta || isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <div className="flex gap-1 ml-1">
                        {[50, 100, 200].map((n) => (
                          <Button
                            key={n}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 px-2"
                            onClick={() => addQuick(n)}
                            disabled={delta + n > maxDelta || isPending}
                          >
                            +{n}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Pool disponible:{" "}
                      <span className="font-medium">
                        {availableStock.toLocaleString("es-AR")} tickets
                      </span>
                    </p>

                    {isEditing && (
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Total después de agregar:{" "}
                        <span className="font-bold">
                          {newTotal.toLocaleString("es-AR")} tickets
                        </span>
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || maxDelta === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Agregar" : "Asignar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
