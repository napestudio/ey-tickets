"use client";

import type React from "react";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isBefore } from "date-fns";
import { Check, Copy, Link2, Users } from "lucide-react";

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
  const [open, setOpen] = useState(false);
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
        handleClose();
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
      <DialogContent className="sm:max-w-150 max-h-[85vh] overflow-hidden flex flex-col">
        {generatedLink ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle>Link generado</DialogTitle>
              <DialogDescription>
                Compartí este link con tu invitado. También le enviamos un email
                con el link.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm break-all flex-1">{generatedLink}</span>
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

            <DialogFooter className="shrink-0 pt-2">
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="text-left shrink-0">
              <DialogTitle>Agregar invitado</DialogTitle>
              <DialogDescription>Invitación para {evento?.title}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="individual" className="flex flex-col flex-1 overflow-hidden">
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
                          Si no completás nombre y apellido, se generará un link
                          para que el invitado complete sus datos.
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["1","2","3","4","5","6","7","8","9","10"].map(
                                    (v) => (
                                      <SelectItem key={v} value={v}>
                                        {v}
                                      </SelectItem>
                                    ),
                                  )}
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
                                    <SelectValue placeholder="Seleccionar" />
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
                                      const available =
                                        ticket.quantity! -
                                        (soldTickets
                                          ? (soldTickets[ticket.id!]?.count ?? 0)
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
                      </div>
                    </div>

                    <DialogFooter className="shrink-0 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creando..." : "Crear invitación"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>

              {/* Bulk import tab */}
              <TabsContent value="bulk" className="flex-1 overflow-y-auto mt-0 pt-4">
                <BulkInvitationImport
                  evento={evento!}
                  soldTickets={soldTickets}
                  onSuccess={handleClose}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
