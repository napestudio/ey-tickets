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
import { CalendarIcon, Loader2, TrashIcon } from "lucide-react";
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
import { adjustTicketStock, updateTicketType } from "@/lib/actions";
import { DatesType, TicketType } from "@/types/tickets";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import Box from "@/components/dashboard/box";

export default function EditTycketTypeForm({
  evento,
  ticket,
  eventId,
  soldCount,
}: {
  evento: Evento;
  ticket: TicketType;
  eventId: string;
  soldCount: number;
}) {
  const FormSchema = z.object({
    selectedDates: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: "Debes seleccionar al menos una fecha",
      }),
    title: z.string(),
    description: z.string().optional(),
    price: z.number(),
    discount: z.number().optional(),
    multi: z.boolean(),
    isFree: z.boolean().default(false),
    status: z.enum(["ACTIVE", "INACTIVE", "ENDED", "DELETED", "SOLDOUT"]),
    endDate: z.date().optional(),
  });

  const { toast } = useToast();
  const router = useRouter();
  const backHref = `/dashboard/evento/ticket-types/${eventId}`;
  const parsedEventDates = JSON.parse(evento.dates as string);
  const parsedTicketDates = JSON.parse(ticket.dates as string);
  const datesValue = parsedTicketDates.map((date: DatesType) => date.date);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasDiscount, setHasDiscount] = useState<boolean>(
    ticket.discount !== 0 ? true : false,
  );

  // Stock control state
  const [stockDelta, setStockDelta] = useState<number>(0);
  const [stockReason, setStockReason] = useState<string>("");
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);

  const currentStock = ticket.quantity as number;
  const available = currentStock - soldCount;
  const previewQuantity = currentStock + stockDelta;
  const previewAvailable = previewQuantity - soldCount;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedDates: datesValue,
      title: ticket.title,
      description: ticket.description || "",
      price: ticket.price as number,
      status: ticket.status,
      discount: ticket.discount || undefined,
      multi: ticket.buyGet ? true : false,
      isFree: ticket.isFree,
      endDate: ticket.endDate || undefined,
    },
  });

  async function handleDeleteTicketType(ticketId: string) {
    setIsLoading(true);
    const data: Partial<TicketType> = {
      status: "DELETED",
    };
    try {
      await updateTicketType(data, ticket.id as string);
      toast({
        title: "Tipo de ticket eliminado!",
      });
      router.push(backHref);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar el tipo de ticket",
        description: error instanceof Error ? error.message : "Error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStockAdjust() {
    if (stockDelta === 0) return;
    setIsAdjusting(true);
    try {
      await adjustTicketStock(ticket.id!, stockDelta, stockReason || undefined);
      toast({ title: "Stock actualizado." });
      setStockDelta(0);
      setStockReason("");
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al ajustar el stock",
        description: error instanceof Error ? error.message : "Error inesperado.",
      });
    } finally {
      setIsAdjusting(false);
    }
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    const formatedDates = values.selectedDates.map((date, index) => ({
      id: index,
      date: date,
    }));
    const stringDates = JSON.stringify(formatedDates);

    const data: Partial<TicketType> = {
      title: values.title,
      description: values.description || null,
      price: values.price as number,
      dates: stringDates,
      discount: values.discount,
      buyGet: values.multi === true ? 2 : 0,
      isFree: values.isFree,
      endDate: values.endDate,
      status: values.status,
    };
    try {
      await updateTicketType(data, ticket.id as string);
      toast({
        title: "Tipo de ticket editado!",
      });
      router.push(backHref);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al editar el tipo de ticket",
        description: error instanceof Error ? error.message : "Error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                            render={({ field }) => (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-center space-x-3 space-y-0 p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.date)}
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([...field.value, item.date])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.date,
                                            ),
                                          )
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-medium">
                                  {format(new Date(item.date), "dd/MM/yyyy - HH:mm", { locale: es })}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Box>

            {/* Stock management panel */}
            <Box>
              <div className="space-y-6">
                <h3 className="font-bold">Stock</h3>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold">{currentStock}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total asignado</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold">{soldCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vendidos</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-2xl font-bold">{available}</p>
                    <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
                  </div>
                </div>

                {/* Quick-delta buttons */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ajuste rápido</p>
                  <div className="flex flex-wrap gap-2">
                    {([-100, -20, -10, 10, 20, 100] as const).map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStockDelta((prev) => prev + amount)}
                      >
                        {amount > 0 ? `+${amount}` : amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom delta input */}
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="w-32"
                    placeholder="0"
                  />
                  {stockDelta !== 0 && (
                    <span className="text-sm text-muted-foreground">
                      Resultado: {previewQuantity} ({previewAvailable >= 0 ? previewAvailable : 0} disponibles)
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStockDelta(0)}
                    disabled={stockDelta === 0}
                  >
                    Limpiar
                  </Button>
                </div>

                {/* Reason */}
                <Input
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="Motivo (opcional)"
                />

                <Button
                  type="button"
                  onClick={handleStockAdjust}
                  disabled={stockDelta === 0 || isAdjusting}
                >
                  {isAdjusting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    `Aplicar ${stockDelta > 0 ? "+" : ""}${stockDelta || 0}`
                  )}
                </Button>
              </div>
            </Box>

            <Box>
              <div className="space-y-8">
                <h3 className="font-bold">Disponibilidad</h3>
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Disponible hasta</FormLabel>
                      <div className="flex items-center gap-2">
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
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => field.onChange(undefined)}
                            aria-label="Quitar fecha límite"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
                      defaultValue={ticket.status}
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
                        disabled={form.watch("isFree")}
                        onCheckedChange={(checked) => {
                          setHasDiscount(checked);
                          if (!checked) form.setValue("discount", undefined);
                        }}
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
                                value={field.value ?? ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if (val >= 100) {
                                    form.setValue("isFree", true);
                                    setHasDiscount(false);
                                    field.onChange(undefined);
                                  } else {
                                    field.onChange(val);
                                  }
                                }}
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
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              setHasDiscount(false);
                              form.setValue("discount", undefined);
                            }
                          }}
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

        <div className="flex justify-between">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <TrashIcon className="w-6 h-6" />
                <span className="sr-only"> Eliminar </span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar</AlertDialogTitle>
                <AlertDialogDescription>
                  Eliminar tipo de ticket?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-4 items-center">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteTicketType(ticket.id!)}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
