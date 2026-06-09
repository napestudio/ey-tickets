"use client";

import type React from "react";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isBefore } from "date-fns";
import { Copy, Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { InvitationMethodInput, inviteUserToEvent } from "@/lib/actions";

import { Evento } from "@/types/event";
import { toast } from "../ui/use-toast";
import { TicketType } from "@/types/tickets";

const invitationSchema = z
  .object({
    isCustomizable: z.boolean(),
    quantity: z
      .string({
        required_error: "Por favor seleccioná una cantidad",
      })
      .min(1, { message: "Este campo es obligatorio" }),
    ticketType: z
      .string({
        required_error: "Por favor seleccioná un tipo de entrada",
      })
      .min(1, { message: "Este campo es obligatorio" }),
    email: z.string().default(""),
    name: z.string().default(""),
    lastName: z.string().default(""),
    dni: z.string().default(""),
  })
  .superRefine((data, ctx) => {
    if (!data.isCustomizable) {
      if (!z.string().email().min(5).safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Debe ser un email válido",
        });
      }
      if (data.name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Debe tener al menos 2 caracteres",
        });
      }
      if (data.lastName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["lastName"],
          message: "Debe tener al menos 2 caracteres",
        });
      }
      if (data.dni.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dni"],
          message: "Este campo es obligatorio",
        });
      }
    }
  });

type InvitationForm = z.infer<typeof invitationSchema>;

interface AddInvitationMethodDialogProps {
  children: React.ReactNode;
  evento?: Evento;
  soldTickets?: Record<
    string,
    {
      id?: string | undefined;
      title?: string | undefined;
      count?: number | undefined;
    }
  >;
  isEventOwner?: boolean;
}

export function AddInvitationDialog({
  children,
  evento,
  soldTickets,
  isEventOwner,
}: AddInvitationMethodDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      isCustomizable: false,
      email: "",
      name: "",
      lastName: "",
      dni: "",
      quantity: "0",
      ticketType: "",
    },
  });

  const { watch } = form;
  const isCustomizable = watch("isCustomizable");

  const handleClose = () => {
    form.reset();
    setGeneratedLink(null);
    setCopied(false);
    setOpen(false);
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: InvitationForm) => {
    setIsSubmitting(true);
    try {
      const payload: InvitationMethodInput = {
        quantity: parseInt(data.quantity),
        email: data.email,
        ticketTypeId: data.ticketType,
        isInvitation: true,
        status: "PAID",
        eventId: evento?.id,
        name: data.name,
        lastName: data.lastName,
        dni: data.dni,
        totalPrice: 0,
        isCustomizable: data.isCustomizable,
      };

      const result = await inviteUserToEvent(payload);

      if (data.isCustomizable && result.customizationToken) {
        const link = `${window.location.origin}/invitaciones/${result.customizationToken}`;
        setGeneratedLink(link);
      } else {
        handleClose();
        toast({
          title: "Invitación creada",
          description: "La invitación fue creada exitosamente.",
        });
      }
    } catch (error) {
      console.error("Error creando invitación", error);
      toast({
        title: "Error",
        description: "No se pudo crear la invitación. Intentá de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPastEndDate = (endDate: Date): boolean => {
    return isBefore(new Date(endDate), new Date());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-hidden flex flex-col">
        {generatedLink ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle>Link generado</DialogTitle>
              <DialogDescription>
                Compartí este link con tu invitado para que complete sus datos.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm break-all flex-1">
                  {generatedLink}
                </span>
              </div>
              <Button className="w-full" onClick={copyLink} variant="outline">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar link
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                El link solo puede usarse una vez. Una vez que el invitado
                complete sus datos, no podrá modificarlos.
              </p>
            </div>

            <DialogFooter className="shrink-0 pt-2">
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
              autoComplete="off"
            >
              <DialogHeader className="text-left">
                <DialogTitle>Crear invitación</DialogTitle>
                <DialogDescription>
                  Invitación para el evento {evento?.title}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4 overflow-y-auto pr-1">
                <FormField
                  control={form.control}
                  name="isCustomizable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 rounded-lg border p-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          Invitación personalizable
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Generá un link para que el invitado complete sus
                          propios datos
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Card>
                  <CardContent className="space-y-4 mt-4">
                    {!isCustomizable && (
                      <>
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del invitado</FormLabel>
                              <FormControl>
                                <Input placeholder="Juan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido del invitado</FormLabel>
                              <FormControl>
                                <Input placeholder="Perez" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dni"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>DNI del invitado</FormLabel>
                              <FormControl>
                                <Input placeholder="12345678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email del invitado</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="invitado@gmail.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad de entradas</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cantidad de entradas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                              ].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ticketType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de entrada</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo de entrada" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {evento?.ticketTypes
                                ?.filter(
                                  (ticket: Partial<TicketType>) =>
                                    ticket.status !== "DELETED" &&
                                    ticket.status !== "INACTIVE",
                                )
                                .map((ticket, i) => {
                                  const soldTicketCount =
                                    ticket.quantity! -
                                    (soldTickets
                                      ? (soldTickets[ticket.id!]?.count ?? 0)
                                      : 0);
                                  const ticketSoldOut =
                                    soldTicketCount <= 0 ||
                                    soldTicketCount <
                                      parseInt(watch("quantity"));
                                  return (
                                    <SelectItem
                                      key={i}
                                      value={ticket?.id!}
                                      disabled={
                                        ticketSoldOut ||
                                        ticket.status === "INACTIVE" ||
                                        ticket.status === "SOLDOUT" ||
                                        (ticket.endDate
                                          ? isPastEndDate(ticket.endDate)
                                          : false)
                                      }
                                    >
                                      {ticket?.title}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="shrink-0 pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Creando..."
                    : isCustomizable
                      ? "Generar link"
                      : "Enviar invitación"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
