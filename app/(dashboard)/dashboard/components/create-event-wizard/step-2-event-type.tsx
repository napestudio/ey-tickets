"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Box from "@/components/dashboard/box";
import { cn } from "@/lib/utils";
import { WizardStep2Data } from "./types";

const step2Schema = z.object({
  eventType: z.enum(["PUBLIC", "PRIVATE"]),
});

type Step2Schema = z.infer<typeof step2Schema>;

interface Step2EventTypeProps {
  initialData: WizardStep2Data | null;
  onComplete: (data: WizardStep2Data) => void;
  onBack: () => void;
}

export function Step2EventType({
  initialData,
  onComplete,
  onBack,
}: Step2EventTypeProps) {
  const form = useForm<Step2Schema>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      eventType: initialData?.eventType ?? "PUBLIC",
    },
  });

  const eventType = form.watch("eventType");

  function onSubmit(values: Step2Schema) {
    onComplete({ eventType: values.eventType });
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
                      onClick={() => form.setValue("eventType", "PUBLIC")}
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
                      onClick={() => form.setValue("eventType", "PRIVATE")}
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

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
