"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { submitCustomizationForm } from "@/lib/actions";

const ticketSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
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

interface SerializedTicket {
  id: string;
  code: number | null;
  date: string;
}

interface CustomizationFormProps {
  token: string;
  order: {
    quantity: number;
    event: { title: string };
    ticketType: { title: string };
    tickets: SerializedTicket[];
  };
}

export function CustomizationForm({ token, order }: CustomizationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tickets: order.tickets.map((t) => ({
        id: t.id,
        name: "",
        lastName: "",
        dni: "",
        email: "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  const replicateFirst = () => {
    const first = form.getValues("tickets.0");
    fields.forEach((_, index) => {
      if (index === 0) return;
      form.setValue(`tickets.${index}.name`, first.name, {
        shouldValidate: true,
      });
      form.setValue(`tickets.${index}.lastName`, first.lastName, {
        shouldValidate: true,
      });
      form.setValue(`tickets.${index}.dni`, first.dni, {
        shouldValidate: true,
      });
      form.setValue(`tickets.${index}.email`, first.email, {
        shouldValidate: true,
      });
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await submitCustomizationForm(token, data.tickets);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{order.event.title}</h1>
          <p className="text-muted-foreground">
            Personalizá tu invitación con tu nombre y DNI para ingresar al
            evento.
          </p>
          <p className="text-xs text-muted-foreground">
            Por seguridad no compartas esta invitación con nadie.
          </p>
          <p className="text-sm text-muted-foreground">
            {order.quantity} entrada{order.quantity !== 1 ? "s" : ""} —{" "}
            {order.ticketType.title}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Entrada #{index + 1}
                    </CardTitle>
                    {index === 0 && fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={replicateFirst}
                      >
                        Replicar en todas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tickets.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
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
                            <Input placeholder="Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`tickets.${index}.dni`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678" {...field} />
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
                          <Input placeholder="juan@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            <p className="text-xs text-muted-foreground">
              Una vez confirmados, tus datos no podrán modificarse.
            </p>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar invitación"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
