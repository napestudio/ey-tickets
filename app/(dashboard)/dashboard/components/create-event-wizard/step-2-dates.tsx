"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import Box from "@/components/dashboard/box";
import DatesPicker from "@/components/dates-picker/dates-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { WizardStep3Data, DateTimeSelection } from "./types";

const step2Schema = z.object({
  saleEndDate: z.date({
    required_error: "La fecha de finalización es obligatoria",
  }),
});

type Step2Schema = z.infer<typeof step2Schema>;

interface Step2DatesProps {
  initialData: WizardStep3Data | null;
  onComplete: (data: WizardStep3Data) => void;
  onBack: () => void;
}

export function Step2Dates({ initialData, onComplete, onBack }: Step2DatesProps) {
  const [dateTimeSelections, setDateTimeSelections] = useState<DateTimeSelection[]>(
    initialData?.dateTimeSelections ?? [
      { id: 0, date: `${new Date().toISOString().slice(0, 10)}T20:00` },
    ]
  );

  const form = useForm<Step2Schema>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      saleEndDate: initialData?.saleEndDate ?? (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
    },
  });

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
      {
        id: newId,
        date: nextDatePart ? `${nextDatePart}T${timePart}` : `T${timePart}`,
      },
    ]);
  };

  const handleRemoveDateTime = (id: number) => {
    setDateTimeSelections(
      dateTimeSelections.filter((selection) => selection.id !== id)
    );
  };

  const handleDateChange = (date: string, id: number) => {
    const updatedSelections = dateTimeSelections.map((selection) => {
      if (selection.id === id) {
        return { ...selection, date };
      }
      return selection;
    });
    setDateTimeSelections(updatedSelections);

    const isFirstDate = id === dateTimeSelections[0]?.id;
    if (isFirstDate && !form.formState.dirtyFields.saleEndDate) {
      const datePart = date.split("T")[0];
      if (datePart) {
        const newEndDate = new Date(`${datePart}T20:00:00`);
        form.setValue("saleEndDate", newEndDate, { shouldDirty: false });
      }
    }
  };

  function onSubmit(values: Step2Schema) {
    onComplete({
      dateTimeSelections,
      saleEndDate: values.saleEndDate,
    });
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
            <p className="text-xs text-muted-foreground">
              La configuración individual por tipo de ticket se realiza en el
              formulario de tipo de ticket.
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
                            variant={"outline"}
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
                            updated.setHours(
                              current.getHours(),
                              current.getMinutes()
                            );
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
                        value={`${field.value
                          .getHours()
                          .toString()
                          .padStart(2, "0")}:${field.value
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}`}
                        onValueChange={(time) => {
                          const [hours, minutes] = time.split(":").map(Number);
                          const updated = new Date(field.value);
                          updated.setHours(hours, minutes);
                          field.onChange(updated);
                        }}
                      >
                        <SelectTrigger className="w-35">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <ScrollArea className="h-60">
                            {Array.from({ length: 96 }).map((_, i) => {
                              const hour = Math.floor(i / 4)
                                .toString()
                                .padStart(2, "0");
                              const minute = ((i % 4) * 15)
                                .toString()
                                .padStart(2, "0");
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
