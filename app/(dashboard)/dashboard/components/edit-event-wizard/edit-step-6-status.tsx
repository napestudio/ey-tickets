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
import { Button } from "@/components/ui/button";
import Box from "@/components/dashboard/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { EventStatus } from "@/types/event";

const schema = z.object({
  status: z.enum(["ACTIVE", "DRAFT", "CONCLUDED", "CANCELED"]),
});

type Schema = z.infer<typeof schema>;

interface Props {
  initialData: { status: EventStatus };
  onSave: (data: { status: EventStatus }) => Promise<void>;
}

export function EditStep6Status({ initialData, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { status: initialData.status as Schema["status"] },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(values: Schema) {
    setIsSaving(true);
    try {
      await onSave({ status: values.status as EventStatus });
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
            <h2 className="font-bold">Estado del evento</h2>
            <p className="text-sm text-muted-foreground">
              Controlá la visibilidad y el estado de tu evento.
            </p>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Publicado</SelectItem>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="CANCELED">Cancelado</SelectItem>
                      <SelectItem value="CONCLUDED">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
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
