"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Loader2, BanknoteIcon as Bank, CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";

import {
  createDiscountCode,
  deleteDiscountCode,
  updateDiscountCode,
} from "@/lib/actions";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Evento } from "@/types/event";
import { DiscountCode } from "@/types/discount-code";
import RemoveDiscountCodeAlert from "./remove-discount-code-alert";

const formSchema = z.object({
  code: z.string().min(5, {
    message: "El codigo debe tener al menos 5 caracteres.",
  }),
  eventId: z.string(),
  expiresAt: z.date(),
  discount: z.number(),
  status: z.enum(["DRAFT", "ACTIVE", "CANCELED", "CONCLUDED", "DELETED"]),
  //.refine((file) => file?.length == 1, "File is required."),
});

interface DiscountCodeDialogProps {
  children: React.ReactNode;
  evento: Evento;
  code?: DiscountCode;
}

export function DiscountCodeDialog({
  children,
  evento,
  code,
}: DiscountCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: code?.code || "",
      eventId: code?.eventId || "",
      discount: code?.discount || 0,
      status: "ACTIVE",
      expiresAt: code?.expiresAt || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (code) {
      updateDiscountCode(
        {
          code: values.code,
          expiresAt: new Date(values.expiresAt),
          status: "ACTIVE",
          discount: values.discount,
          eventId: evento.id,
        },
        code.id as string
      )
        .then(() => {
          setIsLoading(false);
          setOpen(false);
          toast({
            title: "Código editado!",
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "error editado código",
          });
          setOpen(false);
          setIsLoading(false);
        });
    } else {
      createDiscountCode({
        code: values.code,
        expiresAt: new Date(values.expiresAt),
        status: "ACTIVE",
        discount: values.discount,
        eventId: evento.id,
      })
        .then(() => {
          form.reset();
          setOpen(false);
          setIsLoading(false);
          toast({
            title: "Código creado!",
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "error creando código",
          });
          setIsLoading(false);
        });
    }
    form.reset();
  }

  useEffect(() => {
    if (code) {
      form.reset();
    }
  }, [code, code?.code, form]);

  const handleDeleteCode = () => {
    if (!code) return;
    try {
      deleteDiscountCode(code.id as string)
        .then(() => {
          setOpen(false);
          toast({
            title: "Código borrado!",
          });
        })
        .catch((error: string) => {
          setOpen(false);
          toast({
            variant: "destructive",
            title: "Error eliminado el codigo",
          });
        });
    } catch (error) {}
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="text-left">
          <DialogTitle>
            {code ? "Editar" : "Agregar"} Código de Descuento
          </DialogTitle>
          <DialogDescription>
            {code
              ? "Editar o eliminar este código"
              : "Este código agrega un porcentaje de descuento en la compra de cualquier tipo de ticket"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values: any) => onSubmit(values))}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="NUEVOCODIGO123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento del</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Porcentaje de descuento"
                      max={100}
                      maxLength={3}
                      {...field}
                      type="number"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-[240px] pl-3 text-left font-normal")}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Vencimiento</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
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
            <div className="flex justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar codigo"
                )}
              </Button>

              {code && (
                // <Button variant="destructive" disabled={isLoading}>
                //   {isLoading ? (
                //     <>
                //       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                //       Eliminando...
                //     </>
                //   ) : (
                //     "Eliminar codigo"
                //   )}
                // </Button>
                <RemoveDiscountCodeAlert action={handleDeleteCode} />
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
