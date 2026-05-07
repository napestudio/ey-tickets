"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCashOrder } from "@/lib/actions";
import { datesFormater } from "@/lib/utils";
import { Input } from "../ui/input";
import { DiscountCode } from "@/types/discount-code";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "../ui/use-toast";
import { isAfter, isBefore } from "date-fns";

export type TicketType = {
  id: string;
  title: string;
  date: Date | null;
  time: string | null;
  price: number;
  eventId: string;
  status: string;
  type: string;
  startDate: Date | null;
  endDate: Date;
  quantity: number;
  position: number;
  dates: { id: number; date: string }[];
  createdAt: Date;
  updatedAt: Date;
  buyGet?: number;
};

const FormSchema = z
  .object({
    ticketType: z.string({
      required_error: "Por favor seleccioná un tipo de entrada.",
    }),
    quantity: z.string({
      required_error: "Por favor seleccioná la cantidad de tickets.",
    }),
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
      .max(8, { message: "Debe tener 8 dígitos" }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Los correos electrónicos deben coincidir",
    path: ["confirmEmail"],
  });

export default function BuyTicketForm({
  tickets,
  eventId,
  discountCode,
  serviceCharge,
  soldTickets,
}: {
  tickets: any;
  eventId: string;
  discountCode?: Partial<DiscountCode>[];
  serviceCharge?: number;
  soldTickets?: { id?: string; title?: string; count?: number };
}) {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState(false);
  const [addedCode, setaddedCode] = useState<string | undefined>("");
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [discountPer, setDiscountPer] = useState(0);

  const calculateTotal = (ticketPrice: number, quantity: number) => {
    let calculatedTotal = ticketPrice * quantity;
    setSubtotal(0);

    if (discount && discountCode?.length && addedCode) {
      const appliedDiscount = discountCode.find(
        (code) => code.id === addedCode
      );
      if (appliedDiscount && appliedDiscount.discount) {
        const discountPercentage = appliedDiscount.discount / 100;
        calculatedTotal -= calculatedTotal * discountPercentage;
        setSubtotal(ticketPrice);
        setDiscountPer(appliedDiscount.discount);
      }
    }
    if (serviceCharge) {
      setSubtotal(calculatedTotal);
      calculatedTotal += (calculatedTotal * serviceCharge) / 100;
    }
    setTotal(calculatedTotal);
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ticketType: undefined,
      quantity: undefined,
      name: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      phone: "",
      dni: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const orderData: any = {
      ticketTypeId: data.ticketType,
      status: "PAID",
      quantity: parseInt(data.quantity),
      hasCode: discount,
      discountCode: addedCode,
      eventId: eventId,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dni: data.dni,
      // totalPrice: total,
    };

    createCashOrder(orderData)
      .then(() => {
        setTotal(0);
        setIsLoading(false);
        toast({
          title: "Venta exitosa.",
        });
        form.reset();
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Ocurrió un error.",
        });
        throw new Error("Error creando order");
      });
  }

  const isPastEndDate = (endDate: Date): boolean => {
    return isBefore(new Date(endDate), new Date());
  };
  function submitCode(event: FormEvent) {
    setIsLoading(true);

    event.preventDefault();
    const matchingCode = discountCode?.find(
      (discount) => discount.code === discountInput
    );

    if (matchingCode) {
      if (matchingCode.expiresAt && !isPastEndDate(matchingCode.expiresAt)) {
        setDiscount(true);
        setaddedCode(matchingCode.id);
        setDiscountOpen(false);
      } else {
        setDiscount(false);
        toast({
          variant: "destructive",
          title: "Código no válido",
        });
        setDiscountOpen(false);
      }
    } else {
      setDiscount(false);
      toast({
        variant: "destructive",
        title: "Código no válido",
      });
      setDiscountOpen(false);
    }
    setIsLoading(false);
    setDiscountInput("");
  }

  useEffect(() => {
    const selectedTicket = tickets.find(
      (ticket: any) => ticket.id === form.getValues().ticketType
    );
    const quantity = parseInt(form.getValues().quantity || "0");

    if (selectedTicket && quantity > 0) {
      calculateTotal(selectedTicket.price, quantity);
    }
  }, [addedCode, form, tickets]);

  return (
    <div className="mb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="ticketType"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedTicket = tickets.find(
                          (ticket: any) => ticket.id === value
                        );
                        if (selectedTicket) {
                          calculateTotal(
                            selectedTicket.price,
                            parseInt(form.getValues().quantity || "0")
                          );
                        }
                      }}
                      defaultValue={field.value}
                      disabled={isLoading}
                      key={form.watch("ticketType")}
                    >
                      <FormControl className="">
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de ticket" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tickets
                          .filter(
                            (ticket: Partial<TicketType>) =>
                              ticket.status !== "DELETED" &&
                              ticket.status !== "INACTIVE"
                          )
                          .map((ticket: Partial<TicketType>) => {
                            const bGet = ticket.buyGet || 1;
                            const soldTicketCount = soldTickets?.id
                              ? // @ts-ignore
                                soldTickets[ticket.id!].count / bGet
                              : 0;
                            const isSoldOut =
                              ticket.quantity! === soldTicketCount;
                            return (
                              <SelectItem
                                value={ticket.id!}
                                key={ticket.id}
                                disabled={
                                  isSoldOut ||
                                  ticket.status === "INACTIVE" ||
                                  ticket.status === "SOLDOUT" ||
                                  (ticket.endDate
                                    ? isPastEndDate(ticket.endDate)
                                    : false)
                                }
                              >
                                {ticket.title} |{" "}
                                {datesFormater(ticket.dates as any)} | $
                                {ticket.price}
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
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedTicket = tickets.find(
                          (ticket: any) =>
                            ticket.id === form.getValues().ticketType
                        );
                        if (selectedTicket) {
                          calculateTotal(selectedTicket.price, parseInt(value));
                        }
                      }}
                      defaultValue={field.value}
                      value={discount ? "1" : field.value}
                      key={form.watch("quantity")}
                      disabled={!form.watch("ticketType") || isLoading}
                    >
                      <FormControl className="">
                        <SelectTrigger>
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        {!discount && (
                          <>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl className="">
                      <Input
                        placeholder="Juan"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl className="">
                      <Input
                        placeholder="Perez"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl className="">
                      <Input
                        placeholder="12345678"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl className="">
                      <Input
                        placeholder="Teléfono"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl className="">
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
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="confirmEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reingresar email</FormLabel>
                    <FormControl className="">
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
            </div>
          </div>

          <div>
            {discount ||
              (serviceCharge && form.watch("quantity") && (
                <>
                  <div className="">
                    <p>
                      SUBTOTAL:{" "}
                      <span className="">
                        ${subtotal.toLocaleString("es-ar")}
                      </span>
                    </p>
                  </div>
                  {discount && (
                    <div className="">
                      <p>- descuento por codigo {discountPer}%</p>
                    </div>
                  )}
                  {serviceCharge && (
                    <div className="">
                      <p>+ costo de servicio {serviceCharge}%</p>
                    </div>
                  )}
                </>
              ))}
            <p className="">
              TOTAL: $<span className="">{total.toLocaleString("es-ar")}</span>
            </p>
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            <span className={`${isLoading ? "hidden" : "block"} `}>
              Emitir tickets
            </span>
            <span className={`${!isLoading ? "hidden" : "block"} `}>
              Emitiendo...
            </span>
          </Button>
        </form>
      </Form>
      {discountCode &&
        !discount &&
        form.watch("ticketType") &&
        form.watch("quantity") && (
          <>
            <Button
              variant={"outline"}
              className=""
              type="button"
              onClick={() => setDiscountOpen(!discountOpen)}
              disabled={isLoading}
            >
              Tengo un código de descuento
            </Button>
            {discountOpen && (
              <div className="">
                <form onSubmit={submitCode}>
                  <Input
                    className=""
                    placeholder="Código de descuento"
                    name="discount-code"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="submit" className="" disabled={isLoading}>
                    Aplicar código
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
    </div>
  );
}
