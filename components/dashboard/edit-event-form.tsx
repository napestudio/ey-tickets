"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateEvent } from "@/lib/actions";
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
import { Evento, EventCategory, EVENT_CATEGORY_LABELS } from "@/types/event";
import { cn, datesFormater } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Loader2, Pencil, X } from "lucide-react";

import Box from "./box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "../ui/calendar";
import { LocationSelect } from "@/components/location-select/location-select";
import { Badge } from "../ui/badge";
import { EventDescription } from "./event-description";

type DateSelection = { id: number; date: string };

const formSchema = z.object({
  title: z.string().min(5, {
    message: "El titulo debe tener al menos 5 caracteres.",
  }),
  description: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string(),
  image: z.string(),
  imagePublicId: z.string().nullish(),
  status: z.enum(["ACTIVE", "DRAFT", "CONCLUDED", "CANCELED", "DELETED"]),
  saleEndDate: z.date({
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

type FormSchema = z.infer<typeof formSchema>;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: {
    label: "ACTIVO",
    color: "bg-cyan-500/20 text-green-700 hover:bg-green-500/20",
  },
  DRAFT: {
    label: "BORRADOR",
    color: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/20",
  },
  CONCLUDED: {
    label: "FINALIZADO",
    color: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20",
  },
  CANCELED: {
    label: "CANCELADO",
    color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
  },
  DELETED: {
    label: "ELIMINADO",
    color: "bg-red-500/20 text-red-700 hover:bg-red-500/20",
  },
};

export default function EditEventForm({ evento }: { evento: Evento }) {
  const parsedDates: DateSelection[] = JSON.parse(evento.dates);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [dateTimeSelections, setDateTimeSelections] =
    useState<DateSelection[]>(parsedDates);
  const [savedDateTimeSelections, setSavedDateTimeSelections] =
    useState<DateSelection[]>(parsedDates);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [restrictions, setRestrictions] = useState<string[]>(
    evento.restrictions ?? [],
  );
  const [savedRestrictions, setSavedRestrictions] = useState<string[]>(
    evento.restrictions ?? [],
  );

  const { toast } = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: evento.title,
      description: evento.description,
      state: evento.state ?? "",
      city: evento.city ?? "",
      address: evento.address,
      image: evento.image || "",
      imagePublicId: evento.imagePublicId ?? null,
      status: evento.status,
      saleEndDate: new Date(evento.saleEndDate || ""),
      category: evento.category ?? null,
      legalText: evento.legalText ?? "",
      venue: evento.venue ?? "",
      ageRestriction: evento.ageRestriction ?? null,
      website: evento.website ?? "",
    },
  });

  const [
    title,
    description,
    city,
    state,
    address,
    status,
    saleEndDate,
    category,
    legalText,
    venue,
    ageRestriction,
    website,
  ] = form.watch([
    "title",
    "description",
    "city",
    "state",
    "address",
    "status",
    "saleEndDate",
    "category",
    "legalText",
    "venue",
    "ageRestriction",
    "website",
  ]);

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
    setDateTimeSelections(
      dateTimeSelections.map((selection) =>
        selection.id === id ? { ...selection, date } : selection,
      ),
    );
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

  const handleSave = async (section: string) => {
    setIsLoading(true);

    try {
      const values = form.getValues();
      const filteredRestrictions = restrictions.filter((r) => r.trim() !== "");
      await updateEvent(
        {
          title: values.title,
          description: values.description,
          state: values.state,
          city: values.city,
          address: values.address,
          image: values.image || null,
          imagePublicId: values.imagePublicId ?? null,
          dates: JSON.stringify(dateTimeSelections),
          saleEndDate: new Date(values.saleEndDate).toISOString(),
          status: values.status,
          category: values.category ?? null,
          legalText: values.legalText ?? null,
          restrictions: filteredRestrictions,
          venue: values.venue ?? null,
          ageRestriction: values.ageRestriction ?? null,
          website: values.website ?? null,
        },
        evento.id,
      );
      form.reset(values);
      setSavedDateTimeSelections([...dateTimeSelections]);
      setSavedRestrictions(filteredRestrictions);
      setActiveSection(null);
      toast({ title: "Evento actualizado" });
    } catch {
      toast({ variant: "destructive", title: "Error editando el evento" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (section: string) => {
    form.reset();
    setDateTimeSelections([...savedDateTimeSelections]);
    if (section === "restrictions") {
      setRestrictions([...savedRestrictions]);
    }
    setActiveSection(null);
  };

  const renderSectionHeader = (key: string, sectionTitle: string) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-bold">{sectionTitle}</h2>
      {activeSection !== key && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={() => setActiveSection(key)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderSectionActions = (key: string) => (
    <div className="flex gap-2 mt-4">
      <Button
        type="button"
        onClick={() => handleSave(key)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar"
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleCancel(key)}
        disabled={isLoading}
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form className="space-y-5 w-full">
        {/* DATOS DEL EVENTO */}
        <Box>
          {renderSectionHeader("datos", "Datos del evento")}
          {activeSection === "datos" ? (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Título</FormLabel>
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
              {renderSectionActions("datos")}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Título</p>
                <p className="text-sm font-medium">{title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Descripción
                </p>
                <EventDescription html={description} />
              </div>
            </div>
          )}
        </Box>

        {/* UBICACIÓN */}
        <Box>
          {renderSectionHeader("ubicacion", "Ubicación")}
          {activeSection === "ubicacion" ? (
            <div className="space-y-4">
              <LocationSelect
                provinceValue={state ?? ""}
                cityValue={city ?? ""}
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
              {renderSectionActions("ubicacion")}
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              {(city || state) && (
                <p>{[city, state].filter(Boolean).join(", ")}</p>
              )}
              {address && <p>{address}</p>}
              {venue && <p className="text-muted-foreground">{venue}</p>}
            </div>
          )}
        </Box>

        {/* FECHAS */}
        <Box>
          {renderSectionHeader("fechas", "Fechas")}
          {activeSection === "fechas" ? (
            <>
              <DatesPicker
                dateTimeSelections={dateTimeSelections}
                onAddDateTime={handleAddDateTime}
                onRemoveDateTime={handleRemoveDateTime}
                onDateChange={handleDateChange}
              />
              {renderSectionActions("fechas")}
            </>
          ) : (
            <p className="text-sm">
              {dateTimeSelections.length > 0
                ? datesFormater(JSON.stringify(dateTimeSelections))
                : "Sin fechas"}
            </p>
          )}
        </Box>

        {/* FIN DE LA VENTA */}
        <Box>
          {renderSectionHeader("fin_venta", "Fin de la venta")}
          {activeSection === "fin_venta" ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona la fecha y hora de finalización de venta de tickets
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
                              updated.setSeconds(0, 0);
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
                            const [hours, minutes] = time
                              .split(":")
                              .map(Number);
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
              {renderSectionActions("fin_venta")}
            </>
          ) : (
            <p className="text-sm">
              {saleEndDate
                ? format(saleEndDate, "d 'de' MMMM yyyy 'a las' HH:mm", {
                    locale: es,
                  })
                : "Sin fecha"}
            </p>
          )}
        </Box>
        {/* CATEGORÍA */}
        <Box>
          {renderSectionHeader("category", "Categoría")}
          {activeSection === "category" ? (
            <>
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
              {renderSectionActions("category")}
            </>
          ) : (
            <p className="text-sm">
              {category ? (
                (EVENT_CATEGORY_LABELS[category as EventCategory] ?? category)
              ) : (
                <span className="text-muted-foreground">Sin categoría</span>
              )}
            </p>
          )}
        </Box>

        {/* RESTRICCIONES */}
        <Box>
          {renderSectionHeader("restrictions", "Restricciones de acceso")}
          {activeSection === "restrictions" ? (
            <div className="space-y-4">
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
              {renderSectionActions("restrictions")}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {savedRestrictions.length > 0 ? (
                <ul className="space-y-1">
                  {savedRestrictions.map((r, i) => (
                    <li key={i} className="text-muted-foreground">
                      — {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Sin restricciones</p>
              )}
              {ageRestriction && (
                <p className="text-muted-foreground">
                  Edad mínima: {ageRestriction} años
                </p>
              )}
            </div>
          )}
        </Box>

        {/* LEGALES */}
        <Box>
          {renderSectionHeader("legalText", "Legales")}
          {activeSection === "legalText" ? (
            <div className="space-y-4">
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
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {renderSectionActions("legalText")}
            </div>
          ) : (
            <div className="text-[0.5rem] text-neutral-400">
              {legalText && <EventDescription html={legalText} />}
            </div>
          )}
        </Box>

        {/* SITIO WEB */}
        <Box>
          {renderSectionHeader("website", "Sitio web")}
          {activeSection === "website" ? (
            <div className="space-y-4">
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
              {renderSectionActions("website")}
            </div>
          ) : (
            <>
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {website}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Sin sitio web</p>
              )}
            </>
          )}
        </Box>

        {/* ESTADO */}
        <Box>
          {renderSectionHeader("estado", "Estado")}
          {activeSection === "estado" ? (
            <>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
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
              {renderSectionActions("estado")}
            </>
          ) : (
            <>
              {status && STATUS_MAP[status] && (
                <Badge className={STATUS_MAP[status].color} variant="secondary">
                  {STATUS_MAP[status].label}
                </Badge>
              )}
            </>
          )}
        </Box>
      </form>
    </Form>
  );
}
