"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Box from "@/components/dashboard/box";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep2Data } from "../create-event-wizard/types";

const schema = z.object({
  eventType: z.enum(["PUBLIC", "PRIVATE"]),
});

type Schema = z.infer<typeof schema>;

interface Props {
  initialData: WizardStep2Data;
  onSave: (data: WizardStep2Data) => Promise<void>;
}

export function EditStep2Tipo({ initialData, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { eventType: initialData.eventType },
  });

  const eventType = form.watch("eventType");
  const isDirty = form.formState.isDirty;

  async function onSubmit(values: Schema) {
    setIsSaving(true);
    try {
      await onSave({ eventType: values.eventType });
      form.reset(values);
    } catch {
      // Error handled by wizard
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Tipo de evento</h2>
            <p className="text-sm text-muted-foreground">
              Seleccioná cómo querés que sea accesible tu evento.
            </p>

            <FormField
              control={form.control}
              name="eventType"
              render={() => (
                <FormItem>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      onClick={() => form.setValue("eventType", "PUBLIC", { shouldDirty: true })}
                      className={cn(
                        "flex-1 cursor-pointer rounded-lg border-2 p-5 transition-all",
                        eventType === "PUBLIC"
                          ? "border-primary ring-2 ring-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <p className="font-semibold">Público, con venta</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Crea un evento con ventas
                      </p>
                    </div>

                    <div
                      onClick={() => form.setValue("eventType", "PRIVATE", { shouldDirty: true })}
                      className={cn(
                        "flex-1 cursor-pointer rounded-lg border-2 p-5 transition-all",
                        eventType === "PRIVATE"
                          ? "border-primary ring-2 ring-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <p className="font-semibold">Evento privado</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Este evento solo es accesible mediante un link y está
                        oculto al público general
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Box>

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
