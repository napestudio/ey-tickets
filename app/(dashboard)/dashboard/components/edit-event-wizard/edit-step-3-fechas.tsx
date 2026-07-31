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
import { CalendarIcon, Loader2 } from "lucide-react";
import Box from "@/components/dashboard/box";
import DatesPicker from "@/components/dates-picker/dates-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { WizardStep3Data, DateTimeSelection } from "../create-event-wizard/types";

const schema = z.object({
  saleEndDate: z.date({ required_error: "La fecha de finalización es obligatoria" }),
});

type Schema = z.infer<typeof schema>;

interface Props {
  initialData: WizardStep3Data;
  onSave: (data: WizardStep3Data) => Promise<void>;
}

export function EditStep3Fechas({ initialData, onSave }: Props) {
  const [dateTimeSelections, setDateTimeSelections] = useState<DateTimeSelection[]>(
    initialData.dateTimeSelections
  );
  const [savedDateTimeSelections, setSavedDateTimeSelections] = useState<DateTimeSelection[]>(
    initialData.dateTimeSelections
  );
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { saleEndDate: initialData.saleEndDate },
  });

  const datesChanged =
    JSON.stringify(dateTimeSelections) !== JSON.stringify(savedDateTimeSelections);
  const isDirty = form.formState.isDirty || datesChanged;

  const handleAddDateTime = () => {
    const lastDate = dateTimeSelections[dateTimeSelections.length - 1];
    const [lastDatePart, lastTimePart] = lastDate?.date.split("T") ?? ["", ""];
    const timePart = lastTimePart || "20:00";
    let nextDatePart = "";
    if (lastDatePart) {
      const next = new Date(`${lastDatePart}T00:00:00`);
      next.setDate(next.getDate() + 1);
      nextDatePart = next.toISOString().slice(0, 10);
    }
    const newId =
      dateTimeSelections.length > 0
        ? Math.max(...dateTimeSelections.map((s) => s.id)) + 1
        : 0;
    setDateTimeSelections([
      ...dateTimeSelections,
      { id: newId, date: nextDatePart ? `${nextDatePart}T${timePart}` : `T${timePart}` },
    ]);
  };

  const handleRemoveDateTime = (id: number) =>
    setDateTimeSelections(dateTimeSelections.filter((s) => s.id !== id));

  const handleDateChange = (date: string, id: number) => {
    const updated = dateTimeSelections.map((s) =>
      s.id === id ? { ...s, date } : s
    );
    setDateTimeSelections(updated);
    const isFirst = id === dateTimeSelections[0]?.id;
    if (isFirst && !form.formState.dirtyFields.saleEndDate) {
      const datePart = date.split("T")[0];
      if (datePart) {
        form.setValue("saleEndDate", new Date(`${datePart}T20:00:00`), {
          shouldDirty: false,
        });
      }
    }
  };

  async function onSubmit(values: Schema) {
    const lastEventDate = dateTimeSelections
      .map((s) => new Date(s.date))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (lastEventDate && values.saleEndDate > lastEventDate) {
      form.setError("saleEndDate", {
        type: "manual",
        message: "La fecha de fin de venta no puede ser posterior a la última fecha del evento.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ dateTimeSelections, saleEndDate: values.saleEndDate });
      form.reset(values);
      setSavedDateTimeSelections([...dateTimeSelections]);
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
            <h2 className="font-bold">Fechas</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona las fechas y horas. Se pueden agregar varias fechas.
            </p>
            <DatesPicker
              dateTimeSelections={dateTimeSelections}
              onAddDateTime={handleAddDateTime}
              onRemoveDateTime={handleRemoveDateTime}
              onDateChange={handleDateChange}
            />
          </div>
        </Box>

        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Fin de la venta</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona la fecha y hora de finalización de venta de tickets.
            </p>
            <div className="flex gap-4 lg:flex-row">
              <FormField
                control={form.control}
                name="saleEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-max">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? format(field.value, "PPP", { locale: es })
                              : "Seleccionar fecha"}
                            <CalendarIcon className="ml-4 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={es}
                          selected={field.value}
                          onSelect={(date) => {
                            const current = field.value ?? new Date();
                            const updated = new Date(date!);
                            updated.setHours(current.getHours(), current.getMinutes());
                            field.onChange(updated);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saleEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Select
                        value={`${field.value.getHours().toString().padStart(2, "0")}:${field.value.getMinutes().toString().padStart(2, "0")}`}
                        onValueChange={(time) => {
                          const [hours, minutes] = time.split(":").map(Number);
                          const updated = new Date(field.value);
                          updated.setHours(hours, minutes, 0, 0);
                          field.onChange(updated);
                        }}
                      >
                        <SelectTrigger className="w-35">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-60">
                            {Array.from({ length: 96 }).map((_, i) => {
                              const hour = Math.floor(i / 4).toString().padStart(2, "0");
                              const minute = ((i % 4) * 15).toString().padStart(2, "0");
                              return (
                                <SelectItem key={i} value={`${hour}:${minute}`}>
                                  {hour}:{minute}
                                </SelectItem>
                              );
                            })}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
