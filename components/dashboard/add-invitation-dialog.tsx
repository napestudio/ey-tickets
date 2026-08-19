"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isBefore } from "date-fns";
import { Check, Copy, Link2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
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
import { BulkInvitationImport } from "./bulk-invitation-import";
import { Evento } from "@/types/event";
import { toast } from "../ui/use-toast";
import { TicketType } from "@/types/tickets";

const invitationSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().optional(),
  lastName: z.string().optional(),
  dni: z.string().optional(),
  quantity: z.string().min(1, { message: "Este campo es obligatorio" }),
  ticketType: z.string().min(1, { message: "Este campo es obligatorio" }),
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [dialogEl, setDialogEl] = useState<HTMLDialogElement | null>(null);
  const handleDialogRef = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    setDialogEl(node);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InvitationForm>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      name: "",
      lastName: "",
      dni: "",
      quantity: "1",
      ticketType: "",
    },
  });

  const { watch } = form;

  const openDialog = () => dialogRef.current?.showModal();

  const resetState = () => {
    form.reset();
    setGeneratedLink(null);
    setCopied(false);
  };

  const closeDialog = () => dialogRef.current?.close();

  // Close when clicking the backdrop (the <dialog> element itself, not its content)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    return;
    if (e.target === dialogRef.current) closeDialog();
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
        name: data.name || undefined,
        lastName: data.lastName || undefined,
        dni: data.dni || undefined,
        totalPrice: 0,
      };

      const result = await inviteUserToEvent(payload);

      if (result.customizationToken) {
        const link = `${window.location.origin}/invitaciones/${result.customizationToken}`;
        setGeneratedLink(link);
      } else {
        closeDialog();
        toast({
          title: "Invitación creada",
          description: "La invitación fue creada y enviada al invitado.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear la invitación.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const isPastEndDate = (endDate: Date): boolean => {
    if (!now) return false;
    return isBefore(new Date(endDate), now);
  };

  return (
    <>
      <span className="contents" onClick={openDialog}>
        {children}
      </span>
      <dialog
        ref={handleDialogRef}
        onClose={resetState}
        onClick={handleBackdropClick}
        className="m-auto w-full max-w-[min(95vw,600px)] max-h-[85vh] overflow-visible rounded-lg border bg-background p-0 shadow-lg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        {/* Stop propagation so inner clicks don't trigger backdrop close */}
        <div
          className="flex flex-col h-full max-h-[85vh] overflow-hidden p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {generatedLink ? (
            <>
              <div className="text-left shrink-0">
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  Link generado
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Compartí este link con tu invitado. También le enviamos un
                  email con el link.
                </p>
              </div>

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
                  El link es de uso único. Una vez que el invitado complete sus
                  datos, no podrá modificarlos.
                </p>
              </div>

              <div className="flex justify-end shrink-0 pt-2">
                <Button onClick={closeDialog}>Cerrar</Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-left shrink-0">
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  Agregar invitado
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Invitación para {evento?.title}
                </p>
              </div>

              <Tabs
                defaultValue="individual"
                className="flex flex-col flex-1 overflow-hidden mt-4"
              >
                <TabsList className="grid grid-cols-2 shrink-0">
                  <TabsTrigger value="individual">Individual</TabsTrigger>
                  <TabsTrigger value="bulk">
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    Importar CSV
                  </TabsTrigger>
                </TabsList>

                {/* Individual tab */}
                <TabsContent
                  value="individual"
                  className="flex flex-col flex-1 overflow-hidden mt-0 pt-4"
                >
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col flex-1 overflow-hidden"
                      autoComplete="off"
                    >
                      <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                        {/* Email — required */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Email del invitado{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
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

                        {/* Optional identity fields */}
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Nombre{" "}
                                  <span className="text-muted-foreground text-xs font-normal">
                                    (opcional)
                                  </span>
                                </FormLabel>
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
                                <FormLabel>
                                  Apellido{" "}
                                  <span className="text-muted-foreground text-xs font-normal">
                                    (opcional)
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Perez" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="dni"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                DNI{" "}
                                <span className="text-muted-foreground text-xs font-normal">
                                  (opcional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="12345678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Hint — shown when name/lastName missing */}
                        {!watch("name") && !watch("lastName") && (
                          <p className="text-xs text-muted-foreground rounded-md bg-muted/50 px-3 py-2">
                            Si no completás nombre y apellido, se generará un
                            link para que el invitado complete sus datos.
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="ticketType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de entrada</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent container={dialogEl}>
                                    {evento?.ticketTypes
                                      ?.filter(
                                        (ticket: Partial<TicketType>) =>
                                          ticket.status !== "DELETED" &&
                                          ticket.status !== "INACTIVE",
                                      )
                                      .map((ticket, i) => {
                                        const available =
                                          ticket.quantity! -
                                          (soldTickets
                                            ? (soldTickets[ticket.id!]?.count ??
                                              0)
                                            : 0);
                                        const ticketSoldOut =
                                          available <= 0 ||
                                          available <
                                            parseInt(watch("quantity") || "1");
                                        return (
                                          <SelectItem
                                            key={i}
                                            value={ticket?.id!}
                                            disabled={
                                              ticketSoldOut ||
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

                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cantidad</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent container={dialogEl}>
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
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 shrink-0 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeDialog}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Creando..." : "Crear invitación"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                {/* Bulk import tab */}
                <TabsContent
                  value="bulk"
                  className="flex-1 overflow-y-auto mt-0 pt-4"
                >
                  <BulkInvitationImport
                    evento={evento!}
                    soldTickets={soldTickets}
                    onSuccess={closeDialog}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
