"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createFreeTicket,
  getMercadPagoUrl,
  payOrderHandler,
  updateOrder,
} from "@/lib/actions";
import { Order } from "@/types/order";
import { useEffect, useState } from "react";
import { createMercadoPagoOrder } from "@/lib/mercadopago";
import { redirect } from "next/navigation";

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Debe tener al menos 2 caracteres",
    }),
    lastName: z.string().min(2, {
      message: "Debe tener al menos 2 caracteres",
    }),
    email: z.string().email().min(5, { message: "Debe ser un email válido" }),
    confirmEmail: z
      .string()
      .email()
      .min(5, { message: "Debe ser un email válido" }),
    phone: z.string(),
    dni: z
      .string()
      .regex(/^[1-9]\d{7}$/, { message: "Debe ser un DNI válido de 8 dígitos" })
      .length(8, { message: "Debe tener 8 dígitos" }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Los correos electrónicos deben coincidir",
    path: ["confirmEmail"],
  });

export default function UserDataForm({ order }: { order: Order }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [isFree, setIsFree] = useState<boolean>(false);
  const orderId = order?.id;
  const userId = order?.event!.userId;

  const totalWithDiscount = hasDiscount
    ? order.ticketType!.price -
      order.ticketType!.price * (discountPercent! / 100)
    : order.ticketType!.price;

  useEffect(() => {
    const matchingCode = order?.event?.discountCode?.find(
      (discount) => discount.id === order.discountCode
    );
    if (matchingCode) {
      setHasDiscount(true);
      setDiscountPercent(matchingCode.discount);
      setIsFree(matchingCode.discount === 100);
    }
  }, [order]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      confirmEmail: "",
      dni: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const orderData = {
      name: values.name,
      lastName: values.lastName,
      phone: values.phone,
      dni: values.dni,
      email: values.email,
    };

    const product = {
      title: order.ticketType!.title,
      price: totalWithDiscount,
      quantity: order.quantity,
      eventId: order.eventId,
    };

    // IF ISFREE SALTEAR MERCADOPAGO
    try {
      if (order.ticketType!.isFree || isFree) {
        await createFreeTicket(orderData, orderId!, userId);
        return;
      }
    } catch (error) {
      throw new Error("Error free ticket");
    }
    // await getMercadPagoUrl(product, orderData, orderId!, userId);

    await createMercadoPagoOrder(product, orderData, orderId!, userId);
  }

  function expire() {
    updateOrder(
      {
        status: "EXPIRED",
      },
      orderId as string
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
          className="space-y-8 w-full"
        >
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl className="border-4 border-black rounded-none p-5">
                    <Input
                      placeholder="Nombre"
                      {...field}
                      disabled={isLoading}
                    />
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
                  <FormLabel>Apellido</FormLabel>
                  <FormControl className="border-4 border-black rounded-none p-5">
                    <Input
                      placeholder="Apellido"
                      {...field}
                      disabled={isLoading}
                    />
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
                <FormLabel>DNI</FormLabel>
                <FormControl className="border-4 border-black rounded-none p-5">
                  <Input placeholder="Dni" {...field} disabled={isLoading} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl className="border-4 border-black rounded-none p-5">
                  <Input
                    placeholder="Telefono"
                    {...field}
                    disabled={isLoading}
                  />
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
                <FormLabel>E-mail</FormLabel>
                <FormControl className="border-4 border-black rounded-none p-5">
                  <Input
                    placeholder="nombre@email.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reingresar email</FormLabel>
                <FormControl className="border-4 border-black rounded-none p-5">
                  <Input
                    placeholder="nombre@email.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full bg-red hover:bg-red-light hover:bg-opacity-10 hover:shadow-none transition-all rounded-none py-8 text-2xl border-4 border-black shadow-hard"
            type="submit"
            disabled={isLoading}
          >
            <span className={`${isLoading ? "hidden" : "block"} `}>Pagar</span>
            <span className={`${!isLoading ? "hidden" : "block"} `}>
              Pagando...
            </span>
          </Button>
        </form>
      </Form>
    </>
  );
}
