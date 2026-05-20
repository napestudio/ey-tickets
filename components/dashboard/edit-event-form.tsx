"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateEvent } from "@/lib/actions";
import { uploadImage, deleteImage } from "@/lib/image-actions";
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
import { Button } from "@/components/ui/button";
import { Evento } from "@/types/event";
import { cn, datesFormater } from "@/lib/utils";

import { useToast } from "@/components/ui/use-toast";
import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";
import { CalendarIcon, Loader2, Pencil } from "lucide-react";

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
  location: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string(),
  image: z.string(),
  imagePublicId: z.string().nullish(),
  file: z.any(),
  status: z.enum(["ACTIVE", "DRAFT", "CONCLUDED", "CANCELED", "DELETED"]),
  endDate: z.date({
    required_error: "La fecha de finalización es obligatoria",
  }),
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
  const [files, setFiles] = useState<File[]>([]);
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    evento.imagePublicId ?? null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUpdated, setFileUpdated] = useState<boolean>(false);

  const { toast } = useToast();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: evento.title,
      description: evento.description,
      location: evento.location ?? "",
      state: evento.state ?? "",
      city: evento.city ?? "",
      address: evento.address,
      image: evento.image || "",
      imagePublicId: evento.imagePublicId ?? null,
      file: evento.image || "",
      status: evento.status,
      endDate: new Date(evento.endDate || ""),
    },
  });

  const [
    title,
    description,
    image,
    city,
    state,
    address,
    location,
    status,
    endDate,
  ] = form.watch([
    "title",
    "description",
    "image",
    "city",
    "state",
    "address",
    "location",
    "status",
    "endDate",
  ]);

  const handleAddDateTime = () => {
    const newSelection: DateSelection = {
      id: dateTimeSelections.length,
      date: new Date().toISOString().slice(0, 16),
    };
    setDateTimeSelections([...dateTimeSelections, newSelection]);
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

  const handleSave = async (section: string) => {
    setIsLoading(true);

    if (section === "imagen" && fileUpdated && files.length > 0) {
      try {
        if (imagePublicId) {
          await deleteImage(imagePublicId);
        }
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadImage(formData, "events");
        if (!res || "ok" in res) {
          throw new Error("Error subiendo la imagen");
        }
        form.setValue("image", res.url);
        form.setValue("imagePublicId", res.publicId);
        setImagePublicId(res.publicId);
        setFileUpdated(false);
      } catch {
        toast({ variant: "destructive", title: "Error subiendo la imagen" });
        setIsLoading(false);
        return;
      }
    }

    try {
      const values = form.getValues();
      await updateEvent(
        {
          title: values.title,
          description: values.description,
          location: values.location,
          state: values.state,
          city: values.city,
          address: values.address,
          image: values.image || null,
          imagePublicId: values.imagePublicId ?? imagePublicId,
          dates: JSON.stringify(dateTimeSelections),
          endDate: new Date(values.endDate).toISOString(),
          status: values.status,
        },
        evento.id,
      );
      form.reset(values);
      setSavedDateTimeSelections([...dateTimeSelections]);
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
    if (section === "imagen") {
      setFiles([]);
      setFileUpdated(false);
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
        {/* IMAGEN */}
        <Box>
          {renderSectionHeader("imagen", "Imagen del evento")}
          {activeSection === "imagen" ? (
            <>
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
                        onDelete={async (_url: string) => {
                          if (imagePublicId) {
                            await deleteImage(imagePublicId);
                          }
                          setImagePublicId(null);
                          form.setValue("image", "");
                          form.setValue("imagePublicId", null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {renderSectionActions("imagen")}
            </>
          ) : (
            <>
              {image ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={evento.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </>
          )}
        </Box>

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
                      <Input
                        placeholder="Dirección del evento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
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
              {location && (
                <p className="text-muted-foreground">{location}</p>
              )}
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
                  name="endDate"
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
                        <PopoverContent
                          className="w-auto p-0"
                          align="start"
                        >
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
              {endDate
                ? format(endDate, "d 'de' MMMM yyyy 'a las' HH:mm", {
                    locale: es,
                  })
                : "Sin fecha"}
            </p>
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
                <Badge
                  className={STATUS_MAP[status].color}
                  variant="secondary"
                >
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
