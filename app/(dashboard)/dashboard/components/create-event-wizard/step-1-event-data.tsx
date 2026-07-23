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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown, ChevronUp, X } from "lucide-react";
import Box from "@/components/dashboard/box";
import DatesPicker from "@/components/dates-picker/dates-picker";
import RichTextEditor from "@/components/dashboard/rich-text-editor";
import { LocationSelect } from "@/components/location-select/location-select";
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
import { EventCategory, EVENT_CATEGORY_LABELS } from "@/types/event";
import { WizardStep1Data, DateTimeSelection } from "./types";

const step1Schema = z.object({
  title: z.string().min(5, {
    message: "El titulo debe tener al menos 5 caracteres.",
  }),
  description: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().min(1, { message: "La dirección es obligatoria." }),
  venue: z.string().optional(),
  endDate: z.date({
    required_error: "La fecha de finalización es obligatoria",
  }),
  category: z
    .enum([
      "MUSIC",
      "THEATER",
      "CONFERENCE",
      "SPORT",
      "ART",
      "GASTRONOMY",
      "COMEDY",
      "DANCE",
      "FESTIVAL",
      "CINEMA",
      "CORPORATE",
      "EXHIBITION",
      "NIGHTLIFE",
      "WORKSHOP",
      "OTHER",
    ])
    .nullish(),
  legalText: z.string().optional(),
  website: z.string().optional(),
  ageRestriction: z.coerce.number().int().positive().nullish(),
});

type Step1Schema = z.infer<typeof step1Schema>;

interface Step1EventDataProps {
  initialData: WizardStep1Data | null;
  onComplete: (data: WizardStep1Data) => void;
}

export function Step1EventData({ initialData, onComplete }: Step1EventDataProps) {
  const [dateTimeSelections, setDateTimeSelections] = useState<DateTimeSelection[]>(
    initialData?.dateTimeSelections ?? [
      { id: 0, date: `${new Date().toISOString().slice(0, 10)}T20:00` },
    ]
  );
  const [restrictions, setRestrictions] = useState<string[]>(
    initialData?.restrictions ?? []
  );
  const [showExtras, setShowExtras] = useState(false);

  const form = useForm<Step1Schema>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      state: initialData?.state ?? "",
      city: initialData?.city ?? "",
      address: initialData?.address ?? "",
      venue: initialData?.venue ?? "",
      endDate: initialData?.endDate ?? (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
      category: initialData?.category ?? null,
      legalText: initialData?.legalText ?? "",
      website: initialData?.website ?? "",
      ageRestriction: initialData?.ageRestriction ?? null,
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
    if (isFirstDate && !form.formState.dirtyFields.endDate) {
      const datePart = date.split("T")[0];
      if (datePart) {
        const newEndDate = new Date(`${datePart}T20:00:00`);
        form.setValue("endDate", newEndDate, { shouldDirty: false });
      }
    }
  };

  const handleAddRestriction = () => {
    setRestrictions([...restrictions, ""]);
  };

  const handleRestrictionChange = (index: number, value: string) => {
    const updated = [...restrictions];
    updated[index] = value;
    setRestrictions(updated);
  };

  const handleRemoveRestriction = (index: number) => {
    setRestrictions(restrictions.filter((_, i) => i !== index));
  };

  function onSubmit(values: Step1Schema) {
    onComplete({
      title: values.title,
      description: values.description,
      state: values.state ?? "",
      city: values.city ?? "",
      address: values.address,
      venue: values.venue ?? "",
      dateTimeSelections,
      endDate: values.endDate,
      category: values.category ?? null,
      legalText: values.legalText ?? "",
      website: values.website ?? "",
      restrictions: restrictions.filter((r) => r.trim() !== ""),
      ageRestriction: values.ageRestriction ?? null,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Datos del evento</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Titulo del evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Box>

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
                name="endDate"
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
                name="endDate"
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

        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Categoría</h2>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]
                      ).map((key) => (
                        <SelectItem key={key} value={key}>
                          {EVENT_CATEGORY_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Box>

        <Box>
          <button
            type="button"
            onClick={() => setShowExtras((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <h2 className="font-bold">Extras</h2>
            {showExtras ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showExtras && (
            <div className="mt-4 space-y-6">
              <FormField
                control={form.control}
                name="legalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Texto legal{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Términos y condiciones, texto legal del evento..."
                        className="min-h-30 resize-y"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sitio web{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.mievento.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>
                  Restricciones de acceso{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FormLabel>
                {restrictions.map((restriction, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={restriction}
                      placeholder="Ej: Mayores de 18 años"
                      onChange={(e) =>
                        handleRestrictionChange(index, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRestriction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddRestriction}
                >
                  + Agregar restricción
                </Button>
              </div>

              <FormField
                control={form.control}
                name="ageRestriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Edad mínima{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        placeholder="Ej: 18"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </Box>

        <div className="flex justify-end">
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
