"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { updateProducerConfigurationAction } from "@/lib/actions";

const FormSchema = z.object({
  serviceCharge: z.coerce.number().min(0).optional().default(0),
  maxValidatorsPerEvent: z.coerce.number().min(0).optional().default(1),
  maxInvitesPerEvent: z.coerce.number().min(0).optional().default(0),
});

type FormValues = z.infer<typeof FormSchema>;

type ProducerConfiguration = {
  serviceCharge: number | null;
  maxValidatorsPerEvent: number | null;
  maxInvitesPerEvent: number | null;
};

type Props = {
  producerId: string;
  configuration: ProducerConfiguration | null;
};

export default function ProducerConfigForm({ producerId, configuration }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      serviceCharge: configuration?.serviceCharge ?? 0,
      maxValidatorsPerEvent: configuration?.maxValidatorsPerEvent ?? 1,
      maxInvitesPerEvent: configuration?.maxInvitesPerEvent ?? 0,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      await updateProducerConfigurationAction(producerId, data);
      toast({ title: "Configuración actualizada correctamente" });
    } catch {
      toast({
        title: "Error al actualizar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium">Límites de configuración</h2>
      <p className="text-sm text-muted-foreground">
        Configurá los límites operativos de tu productora.
      </p>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="serviceCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo de servicio (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxValidatorsPerEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx. validadores por evento</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxInvitesPerEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx. invitaciones por evento</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
