"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { createFreeTicket, updateOrder } from "@/lib/actions";
import { Order } from "@/types/order";
import { useEffect, useState } from "react";
import { createMercadoPagoOrder } from "@/lib/mercadopago";
import { inputClass } from "@/components/website/Contactform";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
    lastName: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Debe ser un email válido" }),
    confirmEmail: z.string().email({ message: "Debe ser un email válido" }),
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

type FormValues = z.infer<typeof formSchema>;

export default function UserDataForm({ order }: { order: Order }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(false);

  const orderId = order?.id;
  const producerId = order?.event!?.producerId;

  const totalWithDiscount = hasDiscount
    ? order.ticketType!.price - order.ticketType!.price * (discountPercent! / 100)
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
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

  async function onSubmit(values: FormValues) {
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

    try {
      if (order.ticketType!.isFree || isFree) {
        await createFreeTicket(orderData, orderId!, producerId);
        return;
      }
    } catch {
      throw new Error("Error free ticket");
    }

    await createMercadoPagoOrder(product, orderData, orderId!, producerId);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 text-white p-6"
    >
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Nombre</label>
          <input
            id="name"
            placeholder="Nombre"
            className={inputClass}
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">Apellido</label>
          <input
            id="lastName"
            placeholder="Apellido"
            className={inputClass}
            disabled={isLoading}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="dni" className="text-sm font-medium">DNI</label>
        <input
          id="dni"
          placeholder="12345678"
          className={inputClass}
          disabled={isLoading}
          {...register("dni")}
        />
        {errors.dni && (
          <p className="text-sm text-destructive">{errors.dni.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
        <input
          id="phone"
          placeholder="+54 9 11 0000-0000"
          className={inputClass}
          disabled={isLoading}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="email" className="text-sm font-medium">E-mail</label>
        <input
          id="email"
          type="email"
          placeholder="nombre@email.com"
          className={inputClass}
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="confirmEmail" className="text-sm font-medium">Confirmar e-mail</label>
        <input
          id="confirmEmail"
          type="email"
          placeholder="nombre@email.com"
          className={inputClass}
          disabled={isLoading}
          {...register("confirmEmail")}
        />
        {errors.confirmEmail && (
          <p className="text-sm text-destructive">{errors.confirmEmail.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full font-bold bg-ey-turquoise text-ey-dark rounded-2xl hover:bg-ey-turquoise-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed py-3"
      >
        {isLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando...
          </span>
        ) : (
          "Pagar"
        )}
      </button>
    </form>
  );
}
