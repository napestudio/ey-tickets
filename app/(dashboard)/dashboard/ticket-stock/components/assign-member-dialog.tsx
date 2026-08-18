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
import { assignMemberAllocationAction } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useProducerStockStore } from "@/store/producer-stock-store";

interface MemberOption {
  id: string;
  name: string | null;
  email: string | null;
}

interface ExistingAllocation {
  userId: string;
  quantity: number;
}

interface AssignMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
  availableStock: number;
  members: MemberOption[];
  existingAllocation?: ExistingAllocation;
}

export default function AssignMemberDialog({
  open,
  onOpenChange,
  producerId,
  availableStock,
  members,
  existingAllocation,
}: AssignMemberDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const refreshStock = useProducerStockStore((s) => s.refresh);

  const maxAllowed = availableStock + (existingAllocation?.quantity ?? 0);

  const schema = z.object({
    userId: z.string().min(1, "Seleccioná un miembro"),
    quantity: z
      .number({ invalid_type_error: "Ingresá una cantidad válida" })
      .min(1, "Debe ser al menos 1")
      .max(maxAllowed, `Máximo disponible: ${maxAllowed}`),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: existingAllocation?.userId ?? "",
      quantity: existingAllocation?.quantity ?? 0,
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await assignMemberAllocationAction(producerId, values.userId, values.quantity);
        toast({
          title: "Cupo asignado",
          description: `Se asignaron ${values.quantity} tickets al miembro.`,
        });
        refreshStock();
        form.reset();
        onOpenChange(false);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err instanceof Error ? err.message : "No se pudo guardar la asignación.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existingAllocation ? "Editar cupo de miembro" : "Asignar tickets a miembro"}
          </DialogTitle>
          <DialogDescription>
            Disponible para asignar: <strong>{maxAllowed}</strong> tickets
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miembro</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!existingAllocation}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccioná un miembro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name ?? m.email ?? m.id}
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
