"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEvent } from "@/lib/actions";
import { uploadImage } from "@/lib/image-actions";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DatesPicker from "@/components/dates-picker/dates-picker";
import RichTextEditor from "@/components/dashboard/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";

import { CalendarIcon, Loader2, X } from "lucide-react";
import Box from "@/components/dashboard/box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { es } from "date-fns/locale";
import { LocationSelect } from "@/components/location-select/location-select";
import { EventCategory } from "@/types/event";

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  MUSIC: "Música",
  THEATER: "Teatro",
  CONFERENCE: "Conferencia",
  SPORT: "Deporte",
  ART: "Arte",
  GASTRONOMY: "Gastronomía",
  COMEDY: "Comedia",
  DANCE: "Danza",
  FESTIVAL: "Festival",
  CINEMA: "Cine",
  CORPORATE: "Corporativo",
  EXHIBITION: "Exposición",
  NIGHTLIFE: "Vida nocturna",
  WORKSHOP: "Taller",
  OTHER: "Otro",
};

const formSchema = z.object({
  title: z.string().min(5, {
    message: "El titulo debe tener al menos 5 caracteres.",
  }),
  description: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string(),
  file: z.any(),
  image: z.string(),
  imagePublicId: z.string().nullish(),
  status: z.enum(["ACTIVE", "DRAFT", "CONCLUDED", "CANCELED", "DELETED"]),
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
  venue: z.string().optional(),
  ageRestriction: z.coerce.number().int().positive().nullish(),
  website: z.string().optional(),
});

export default function CreateEventForm({
  producerId,
}: {
  producerId: string;
}) {
  const [dateTimeSelections, setDateTimeSelections] = useState([
    { id: 0, date: `${new Date().toISOString().slice(0, 10)}T20:00` },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUpdated, setFileUpdated] = useState(false);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      state: "",
      city: "",
      address: "",
      file: "",
      image: "",
      imagePublicId: null,
      status: "ACTIVE",
      endDate: (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0);
        return date;
      })(),
      category: null,
      legalText: "",
      venue: "",
      ageRestriction: null,
      website: "",
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
      dateTimeSelections.filter((selection) => selection.id !== id),
    );
  };

  const handleDateChange = (date: string, id: number) => {
    const updatedSelections = dateTimeSelections.map((selection) => {
      if (selection.id === id) {
        return { ...selection, date: date };
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedDates = JSON.stringify(dateTimeSelections);
    setIsLoading(true);

    if (fileUpdated && files.length > 0) {
      try {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadImage(formData, "events");
        if (!res || "ok" in res) {
          throw new Error("Error subiendo la imagen");
        }
        values.image = res.url;
        values.imagePublicId = res.publicId;
        setFileUpdated(false);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error subiendo la imagen",
        });
        setIsLoading(false);
        return;
      }
    }

    const lastDate = dateTimeSelections.reduce((latest, selection) => {
      return new Date(selection.date) > new Date(latest.date)
        ? selection
        : latest;
    });

    const endDate = new Date(lastDate.date);
    endDate.setHours(23, 59, 0, 0);

    try {
      await createEvent({
        title: values.title,
        description: values.description,
        state: values.state,
        city: values.city,
        address: values.address,
        image: values.image,
        imagePublicId: values.imagePublicId ?? null,
        dates: parsedDates,
        endDate: new Date(values.endDate).toISOString(),
        producerId: producerId,
        slug: `${values.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-${Date.now()}`,
        status: values.status,
        category: values.category ?? null,
        legalText: values.legalText ?? null,
        restrictions: restrictions.filter((r) => r.trim() !== ""),
        venue: values.venue ?? null,
        ageRestriction: values.ageRestriction ?? null,
        website: values.website ?? null,
      });
      form.reset();
      setRestrictions([]);
      setIsLoading(false);
      toast({ title: "Evento creado!" });
    } catch (error) {
      if (
        error instanceof Error &&
        "digest" in error &&
        typeof (error as { digest: unknown }).digest === "string" &&
        (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      toast({ variant: "destructive", title: "error creando evento" });
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-8 w-full"
      >
        <div className="grid lg:grid-cols-3 gap-5">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-5">
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
                  disabled={isLoading}
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
                  Selecciona las fechas y horas. Se pueden agregar varias
                  fechas.
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
                  Selecciona la fecha y hora de finalización de venta de
                  tickets.
                </p>
                <p className="text-xs text-muted-foreground">
                  La configuración individual por tipo de ticket se realiza en
                  el formulario de tipo de ticket.
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
                                  !field.value && "text-muted-foreground",
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
                                  current.getMinutes(),
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
                              const [hours, minutes] = time
                                .split(":")
                                .map(Number);
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
                                    <SelectItem
                                      key={i}
                                      value={`${hour}:${minute}`}
                                    >
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
                <h2 className="font-bold">Legales</h2>
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
              </div>
            </Box>
            <Box>
              <div className="space-y-4">
                <h2 className="font-bold">Sitio web</h2>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        URL{" "}
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
              </div>
            </Box>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5">
            {/* ESTADO (full width) */}
            <div className="w-full">
              <Box>
                <h3 className="font-bold mb-4">Estado</h3>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue="ACTIVE"
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
              </Box>
            </div>
            <Box>
              <div className="space-y-4">
                <h3 className="font-bold">Categoría</h3>
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
                            Object.keys(
                              EVENT_CATEGORY_LABELS,
                            ) as EventCategory[]
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
              <div className="space-y-4">
                <h3 className="font-bold">Imagen del evento</h3>
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUploader
                          onFieldChange={field.onChange}
                          imageUrl={field.value}
                          setFiles={setFiles}
                          setFileUpdated={setFileUpdated}
                          onDelete={async () => {
                            form.setValue("image", "");
                            form.setValue("imagePublicId", null);
                          }}
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
                <h3 className="font-bold">Restricciones de acceso</h3>
                <div className="space-y-2">
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
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Box>
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar evento"
          )}
        </Button>
      </form>
    </Form>
  );
}
