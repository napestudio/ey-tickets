"use client";

import type React from "react";
import Link from "next/link";

import { useState } from "react";
import { Wallet, Landmark, Plus } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Session } from "next-auth";
import { createPaymentMethod } from "@/lib/actions";
import { PaymentType } from "@prisma/client";

const paymentMethodSchema = z.object({
  type: z.enum(["mercadopago", "transfer"], {
    required_error: "Seleccioná un método de pago",
  }),
  accountName: z.string().min(1, "Este campo es obligatorio"),
  apiKey: z.string().optional(),
  cbu: z.string().optional(),
  alias: z.string().optional(),
  transferEmail: z
    .string()
    .email("Ingresá un email válido")
    .optional()
    .or(z.literal("")),
  enabled: z.boolean().default(true),
  commissionPercentage: z.coerce
    .number()
    .min(0, "El valor mínimo es 0")
    .max(100, "El valor máximo es 100")
    .optional(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

interface AddPaymentMethodDialogProps {
  session: Session;
}

export function AddPaymentMethodDialog({
  session,
}: AddPaymentMethodDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: "mercadopago",
      accountName: "",
      apiKey: "",
      cbu: "",
      alias: "",
      transferEmail: "",
      enabled: true,
      commissionPercentage: undefined,
    },
  });

  const { watch } = form;
  const selectedMethod = watch("type");

  const onSubmit = async (data: PaymentMethodForm) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.accountName,
        type:
          data.type === "mercadopago"
            ? ("DIGITAL" as PaymentType)
            : ("TRANSFER" as PaymentType),
        producerId: session.user.producerId!,
        apiKey: data.type === "mercadopago" ? data.apiKey : null,
        cbu: data.type === "transfer" ? data.cbu || null : null,
        alias: data.type === "transfer" ? data.alias || null : null,
        transferEmail:
          data.type === "transfer" ? data.transferEmail || null : null,
        enabled: data.enabled,
        creatorId: session.user.id,
        commissionPercentage: data.commissionPercentage ?? null,
      };

      await createPaymentMethod(payload);
    } catch (error) {
      console.error("Error creando método de pago", error);
    } finally {
      setIsSubmitting(false);
    }
    form.reset();
    setOpen(false);
  };

  const paymentOptions = [
    {
      id: "mercadopago",
      name: "MercadoPago",
      description: "Usando MercadoPago Checkout Pro",
      icon: <Wallet className="h-6 w-6" />,
    },
    {
      id: "transfer",
      name: "Transferencia",
      description: "Transferencia bancaria (CBU/CVU)",
      icon: <Landmark className="h-6 w-6" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Método de pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-hidden flex flex-col">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
            autoComplete="false"
          >
            <DialogHeader className="text-left">
              <DialogTitle>Agregar Método de Pago</DialogTitle>
              <DialogDescription>
                Agregar un método de pago para los eventos
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6 overflow-y-auto pr-1">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">
                      Seleccionar tipo
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4 mt-3"
                      >
                        {paymentOptions.map((option) => (
                          <div key={option.id} className="space-y-0">
                            <FormItem className="flex items-center space-x-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={option.id}
                                  id={option.id}
                                  className="sr-only peer"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={option.id}
                                className="flex items-center justify-between w-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground has-data-[state=checked]:border-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="rounded-full bg-muted p-2 text-primary">
                                    {option.icon}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {option.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {option.description}
                                    </p>
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedMethod && (
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración</CardTitle>
                    <CardDescription>
                      Ingresa los campos requeridos para crear un nuevo método
                      de pago.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la cuenta</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingresa el nombre de esta cuenta"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Este nombre se utiliza para identificar la cuenta.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedMethod === "mercadopago" && (
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Token MercadoPago</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ingresa el Access Token de MercadoPago"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              <Link
                                target="_blank"
                                href="https://www.mercadopago.com.ar/developers/es/docs/security/oauth/creation"
                              >
                                Cómo creo un AccessToken
                              </Link>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {selectedMethod === "transfer" && (
                      <>
                        <FormField
                          control={form.control}
                          name="cbu"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CBU / CVU</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el CBU o CVU"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="alias"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alias</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ingresa el alias"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="transferEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Ingresa el email"
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
                      name="commissionPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comisión (%) - Opcional</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="Ej: 5.99"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? undefined
                                    : e.target.valueAsNumber,
                                )
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Porcentaje que cobra tu método de pago por
                            transacción.
                            <span className="block text-xs text-neutral-500">
                              Dato no público. No afecta el valor de las
                              entradas. Se usa solo para éstadisticas.
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Habilitado</FormLabel>
                            {/* <FormDescription>
                              Una vez habilitado, este método de pago estará
                              disponible para su uso en la plataforma.
                            </FormDescription> */}
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
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="shrink-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Agregando..." : "Agregar Método"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
