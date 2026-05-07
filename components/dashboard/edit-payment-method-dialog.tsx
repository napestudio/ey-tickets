"use client";

import type React from "react";
import Link from "next/link";

import { useState } from "react";
import {
  Loader2,
  CreditCard,
  Wallet,
  BanknoteIcon as Bank,
  Landmark,
  DollarSign,
} from "lucide-react";

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
import { Label } from "@/components/ui/label";
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
import { useForm, useFieldArray } from "react-hook-form";
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
import { User } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Session } from "next-auth";
import { createPaymentMethod, updatePaymentMethod } from "@/lib/actions";
import { PaymentMethod, PaymentType } from "@prisma/client";
import { toast } from "../ui/use-toast";

const paymentMethodSchema = z.object({
  type: z.enum(["CASH", "DIGITAL"], {
    required_error: "Seleccioná un método de pago",
  }),
  accountName: z.string().min(1, "Este campo es obligatorio"),
  apiKey: z.string().optional(),

  enabled: z.boolean().default(true),
  seller: z.string(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

interface EditCustomerSettingsDialogProps {
  sellers?: User[];
  paymentMethod: PaymentMethod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPaymentMethodDialog({
  sellers,
  paymentMethod,
  open,
  onOpenChange,
}: EditCustomerSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: paymentMethod.type,
      accountName: paymentMethod.name || "",
      apiKey: paymentMethod.apiKey || "",
      // secretKey: "",
      enabled: paymentMethod.enabled,
      seller: paymentMethod.userId || "",
    },
  });

  const selectedMethod = paymentMethod.type;

  const onSubmit = async (data: PaymentMethodForm) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.accountName,
        type: data.type,
        clientId: paymentMethod.clientId,
        userId: data.type === "CASH" ? data.seller : undefined,
        apiKey: data.type === "DIGITAL" ? data.apiKey : null,
        enabled: data.enabled,
        creatorId: paymentMethod.creatorId,
      };

      await updatePaymentMethod(payload, paymentMethod.id);
    } catch (error) {
      console.error("Error creando método de pago", error);
    } finally {
      toast({
        title: "Datos actualizados correctamente",
      });
      onOpenChange(false);
      setIsSubmitting(false);
    }
    form.reset();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
            autoComplete="false"
          >
            <DialogHeader className="text-left">
              <DialogTitle>Editar Método de Pago</DialogTitle>
              <DialogDescription>
                Edita la información de: {paymentMethod.name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6 overflow-y-auto pr-1">
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
                    {selectedMethod === "CASH" && (
                      <>
                        {sellers && (
                          <FormField
                            control={form.control}
                            name="seller"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar vendedor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sellers?.map((seller) => (
                                      <SelectItem
                                        key={seller.id}
                                        value={seller.id!}
                                      >
                                        {seller.email}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}

                    {selectedMethod !== "CASH" && (
                      <>
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
                                  Cómo creo un AccessToken{" "}
                                </Link>
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* <FormField
                          control={form.control}
                          name="secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your secret key"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Tu clave secreta.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Habilitado</FormLabel>
                            <FormDescription>
                              Una vez habilitado, este método de pago estará
                              disponible para su uso en la plataforma.
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
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter className="flex-shrink-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || (selectedMethod === "CASH" && !sellers)
                }
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
