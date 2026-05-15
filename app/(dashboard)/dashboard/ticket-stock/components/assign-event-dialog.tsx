"use client";

import { useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { assignEventAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface EventOption {
  id: string;
  title: string;
}

interface ExistingAllocation {
  eventId: string;
  quantity: number;
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

  const maxAllowed = availableStock + (existingAllocation?.quantity ?? 0);

  const schema = z.object({
    eventId: z.string().min(1, "Seleccioná un evento"),
    quantity: z
      .number({ invalid_type_error: "Ingresá una cantidad válida" })
      .min(1, "Debe ser al menos 1")
      .max(maxAllowed, `Máximo disponible: ${maxAllowed}`),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: existingAllocation?.eventId ?? "",
      quantity: existingAllocation?.quantity ?? 0,
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await assignEventAllocationAction(producerId, values.eventId, values.quantity);
        toast({
          title: "Asignación guardada",
          description: `Se asignaron ${values.quantity} tickets al evento.`,
        });
        form.reset();
        onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingAllocation ? "Editar asignación" : "Asignar tickets a evento"}
          </DialogTitle>
          <DialogDescription>
            Disponible para asignar: <strong>{maxAllowed}</strong> tickets
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!existingAllocation}
                  >
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

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tickets a asignar</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={maxAllowed}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
