"use client";

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
import { LocationSelect } from "@/components/location-select/location-select";
import { WizardStep4Data } from "./types";

const step4Schema = z.object({
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().min(1, { message: "La dirección es obligatoria." }),
  venue: z.string().optional(),
});

type Step4Schema = z.infer<typeof step4Schema>;

interface Step4LocationProps {
  initialData: WizardStep4Data | null;
  onComplete: (data: WizardStep4Data) => void;
  onBack: () => void;
}

export function Step4Location({ initialData, onComplete, onBack }: Step4LocationProps) {
  const form = useForm<Step4Schema>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      state: initialData?.state ?? "",
      city: initialData?.city ?? "",
      address: initialData?.address ?? "",
      venue: initialData?.venue ?? "",
    },
  });

  function onSubmit(values: Step4Schema) {
    onComplete({
      state: values.state ?? "",
      city: values.city ?? "",
      address: values.address,
      venue: values.venue ?? "",
    });
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
              onProvinceChange={(value) => form.setValue("state", value)}
              onCityChange={(value) => form.setValue("city", value)}
              disabled={false}
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

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
