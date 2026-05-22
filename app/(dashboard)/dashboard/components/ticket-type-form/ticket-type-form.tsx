"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Evento } from "@/types/event";
import { createTicketType } from "@/lib/actions";
import { DatesType, TicketType } from "@/types/tickets";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Box from "@/components/dashboard/box";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function TycketTypeForm({
  evento,
  remainingTickets,
  redirectTo,
}: {
  evento: Evento;
  remainingTickets: number;
  redirectTo?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const parsedEventDates = JSON.parse(evento.dates);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const FormSchema = z.object({
    selectedDates: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: "Debes seleccionar al menos una fecha",
      }),
    title: z.string(),
    description: z.string().optional(),
    price: z.number(),
    quantity: z.number().max(remainingTickets || 0, {
      message: `No podés crear más de tickets de los disponibles.`,
    }),
    discount: z.number().optional(),
    multi: z.boolean(),
    isFree: z.boolean().default(false),
    status: z.enum(["ACTIVE", "INACTIVE", "ENDED", "DELETED", "SOLDOUT"]),
    endDate: z.date().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedDates: [],
      title: "",
      description: "",
      price: 0,
      status: "ACTIVE",
      quantity: 0,
      discount: 0,
      multi: false,
      isFree: false,
      endDate: undefined,
    },
  });
  function onSubmit(values: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const formatedDates = values.selectedDates.map((date, index) => ({
      id: index,
      date: date,
    }));
    const stringDates = JSON.stringify(formatedDates);

    const data: TicketType = {
      title: values.title,
      description: values.description || null,
      price: !values.isFree ? (values.price as number) : 0,
      dates: stringDates,
      quantity: values.quantity,
      endDate: values.endDate,
      status: values.status,
      eventId: evento.id,
      position: 0,
      discount: values.discount,
      buyGet: values.multi === true ? 2 : 0,
      type: "NORMAL",
      isFree: values.isFree,
    };

    try {
      createTicketType(data);
      form.reset();
      setHasDiscount(false);
      toast({
        title: "Tipo de ticket creado!",
      });
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear el tipo de ticket!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="col-span-2 space-y-8">
            <Box>
              <div className="space-y-8">
                <h3 className="font-bold">Información Básica</h3>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titulo</FormLabel>
                      <FormControl>
                        <Input placeholder="Titulo del Ticket" {...field} />
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
                          placeholder="Descripción del ticket (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={form.watch("isFree")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selectedDates"
                  render={() => (
                    <FormItem>
                      <div className="mb-4"></div>
                      <FormLabel>Fecha(s)</FormLabel>
                      <div className="border p-2">
                        {parsedEventDates.map((item: DatesType) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="selectedDates"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-center space-x-3 space-y-0 p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.date)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.date,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.date,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-medium">
                                    {format(item.date, "dd/MM/yyyy")}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Box>
            <Box>
              <div className="space-y-8">
                <h3 className="font-bold">Disponibilidad</h3>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad disponible</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Disponible hasta</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-60 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Box>

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
                        <SelectItem value="INACTIVE">Pausado</SelectItem>
                        <SelectItem value="SOLDOUT">Agotado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Box>
          </div>
          <div>
            <Box>
              <div className="space-y-8">
                <h3 className="font-bold">Extras</h3>
                <div className="flex flex-col items-center justify-between rounded-lg border p-4">
                  <div className="flex flex-row items-center justify-between w-full flex-1 gap-2">
                    <div className="space-y-0.5">
                      <Label>Descuento</Label>
                      <FormDescription>
                        Agregar un % de descuento al precio del ticket.
                      </FormDescription>
                    </div>
                    <div>
                      <Switch
                        checked={hasDiscount}
                        onCheckedChange={() => setHasDiscount(!hasDiscount)}
                      />
                    </div>
                  </div>
                  {hasDiscount && (
                    <div className="w-full mt-2">
                      <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                disabled={form.watch("isFree")}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 gap-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Gratis</FormLabel>
                        <FormDescription>
                          Al seleccionar este ticket, las entradas llegaran al
                          email del cliente sin confirmación de pago.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 gap-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">2x1</FormLabel>
                        <FormDescription>
                          Los clientes recibiran 2 tickets de este tipo.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
            "Guardar tipo de ticket"
          )}
        </Button>
      </form>
    </Form>
  );
}
