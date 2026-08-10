"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import Box from "@/components/dashboard/box";
import { Loader2 } from "lucide-react";
import { LocationSelect } from "@/components/location-select/location-select";
import { WizardStep4Data } from "../create-event-wizard/types";

const schema = z.object({
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().min(1, { message: "La dirección es obligatoria." }),
  venue: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

interface Props {
  initialData: WizardStep4Data;
  onSave: (data: WizardStep4Data) => Promise<void>;
  producerState?: string;
  producerCity?: string;
}

export function EditStep4Lugar({ initialData, onSave, producerState, producerCity }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      state: initialData.state || producerState || "",
      city: initialData.city || producerCity || "",
      address: initialData.address,
      venue: initialData.venue,
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(values: Schema) {
    setIsSaving(true);
    try {
      await onSave({
        state: values.state ?? "",
        city: values.city ?? "",
        address: values.address,
        venue: values.venue ?? "",
      });
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
            <h2 className="font-bold">Ubicación</h2>
            <LocationSelect
              provinceValue={form.watch("state") ?? ""}
              cityValue={form.watch("city") ?? ""}
              onProvinceChange={(value) =>
                form.setValue("state", value, { shouldDirty: true })
              }
              onCityChange={(value) =>
                form.setValue("city", value, { shouldDirty: true })
              }
              disabled={isSaving}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección del evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre del lugar{" "}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Teatro Colón, Estadio Monumental"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
