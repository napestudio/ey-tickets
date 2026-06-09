"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateInvitationTicketOrders } from "@/lib/actions";

// ─── Schema ───────────────────────────────────────────────────────────────────

const ticketSchema = z.object({
  id: z.string(),
  code: z.number(),
  name: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  dni: z
    .string()
    .min(7, "DNI inválido")
    .max(8, "DNI inválido")
    .regex(/^\d+$/, "Solo números"),
  email: z.string().email("Email inválido"),
});

const formSchema = z.object({
  tickets: z.array(ticketSchema),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface TicketOrder {
  id: string;
  name: string | null;
  lastName: string | null;
  dni: string | null;
  email: string | null;
  code: number | null;
}

interface TicketBulkEditFormProps {
  tickets: TicketOrder[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TicketBulkEditForm({ tickets }: TicketBulkEditFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tickets: tickets.map((t) => ({
        id: t.id,
        code: t.code ?? 0,
        name: t.name ?? "",
        lastName: t.lastName ?? "",
        dni: t.dni ?? "",
        email: t.email ?? "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  // Replica los valores del primer ticket al resto
  function fillFromFirst() {
    const first = form.getValues("tickets.0");
    fields.forEach((_, i) => {
      if (i === 0) return;
      form.setValue(`tickets.${i}.name`, first.name, { shouldValidate: true });
      form.setValue(`tickets.${i}.lastName`, first.lastName, { shouldValidate: true });
      form.setValue(`tickets.${i}.dni`, first.dni, { shouldValidate: true });
      form.setValue(`tickets.${i}.email`, first.email, { shouldValidate: true });
    });
  }

  async function handleSubmit(values: FormValues) {
      const response = await updateInvitationTicketOrders(values.tickets);
      console.log("🚀 ~ handleSubmit ~ response:", response)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

        {/* Tickets */}
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>Ticket {index + 1}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  #{field.code}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name={`tickets.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tickets.${index}.lastName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tickets.${index}.dni`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" maxLength={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tickets.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>
        ))}

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background py-4">
          <p className="text-xs text-muted-foreground">
            Podés replicar los datos del primer ticket al resto
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={fillFromFirst}>
              Replicar primero
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando..." : "Guardar todos"}
            </Button>
          </div>
        </div>

      </form>
    </Form>
  );
}