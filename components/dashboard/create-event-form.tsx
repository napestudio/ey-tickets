"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEvent, uploadEventImage } from "@/lib/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";

import { CalendarIcon, Loader2 } from "lucide-react";
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

const formSchema = z.object({
  title: z.string().min(5, {
    message: "El titulo debe tener al menos 5 caracteres.",
  }),
  description: z.string(),
  location: z.string(),
  address: z.string(),
  file: z.any(),
  image: z.string(),
  status: z.enum(["ACTIVE", "DRAFT", "CONCLUDED", "CANCELED", "DELETED"]),
  endDate: z.date({
    required_error: "La fecha de finalización es obligatoria",
  }),
});

export default function CreateEventForm({ userId }: { userId: string }) {
  const [dateTimeSelections, setDateTimeSelections] = useState([
    { id: 0, date: new Date().toISOString().slice(0, 16) },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [deleteImageValue, setDeleteImageValue] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUpdated, setFileUpdated] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      address: "",
      file: "",
      image: "",
      status: "ACTIVE",
      endDate: (() => {
        const date = new Date();
        date.setHours(20, 0, 0, 0); // 20:00 hs, minutos y segundos en 0
        return date;
      })(),
    },
  });

  const handleAddDateTime = () => {
    const newSelection = {
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
    const updatedSelections = dateTimeSelections.map((selection) => {
      if (selection.id === id) {
        return { ...selection, date: date };
      }
      return selection;
    });
    setDateTimeSelections(updatedSelections);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const parsedDates = JSON.stringify(dateTimeSelections);
    setIsLoading(true);

    // subir imagen a uploadthings
    if (fileUpdated && files.length > 0) {
      try {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadEventImage(formData);
        if (!res) {
          throw new Error("Oops something went wrong");
        }
        if (res.url) {
          values.image = res.url;
          setFileUpdated(false);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error subiendo la imagen",
        });
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Encontrar la última fecha seleccionada
    const lastDate = dateTimeSelections.reduce((latest, selection) => {
      return new Date(selection.date) > new Date(latest.date)
        ? selection
        : latest;
    });

    // Crear endDate con la última fecha seleccionada a las 23:59
    const endDate = new Date(lastDate.date);
    endDate.setHours(23, 59, 0, 0);

    createEvent({
      title: values.title,
      description: values.description,
      location: values.location,
      address: values.address,
      image: values.image,
      dates: parsedDates,
      endDate: new Date(values.endDate).toISOString(),
      userId: userId,
      status: values.status,
    })
      .then(() => {
        form.reset();
        setIsLoading(false);
        toast({
          title: "Evento creado!",
        });
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "error creando evento",
        });
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-8 w-full"
      >
        <div className="grid lg:grid-cols-3 gap-5">
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
                        <Textarea
                          placeholder="Descripción del evento"
                          {...field}
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
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lugar</FormLabel>
                      <FormControl>
                        <Input placeholder="ubicación del evento" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
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
              </div>
            </Box>
            <Box>
              <div className="space-y-4">
                <h2 className="font-bold">Fechas</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona las fechas. Se pueden agregar varias fechas.{" "}
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
                  Selecciona la fecha y hora de finalización de venta de tickets
                </p>
                <div className="flex  gap-4 lg:flex-row">
                  {/* FECHA */}
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

                  {/* HORA */}
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
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className="h-[15rem]">
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
          </div>
          <div>
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
                          setDeleteImageValue={setDeleteImageValue}
                          setFileUpdated={setFileUpdated}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Box>
          </div>
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
