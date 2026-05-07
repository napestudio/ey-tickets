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
import { createOrder, CreateOrderType } from "@/lib/actions";
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

const FormSchema = z.object({
  ticketType: z.string({
    required_error: "Por favor selecciona un tipo de ticket.",
  }),
  quantity: z.string(),
  // code: z.string().optional(),
});

export default function TicketTypePicker({
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
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    const orderData: CreateOrderType = {
      ticketTypeId: data.ticketType,
      status: "PENDING",
      quantity: parseInt(data.quantity),
      hasCode: discount,
      discountCode: addedCode,
      eventId: eventId,
      totalPrice: total,
    };

    createOrder(orderData)
      .then(() => {
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
    <div className="p-3 border-4 border-black shadow-hard bg-white w-full flex-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-2">
            <div className="w-full">
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
                    >
                      <FormControl className="border-4 border-black rounded-none p-5">
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
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="border-3">
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
                    disabled={isLoading}
                    value={discount ? "1" : field.value}
                  >
                    <FormControl className="border-4 border-black rounded-none p-5">
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
          <div>
            {discount ||
              (serviceCharge && form.watch("quantity") && (
                <>
                  <div className="px-1 text-right text-lg font-medium">
                    <p>
                      SUBTOTAL:{" "}
                      <span className="font-bold">
                        ${subtotal.toLocaleString("es-ar")}
                      </span>
                    </p>
                  </div>
                  {discount && (
                    <div className="px-1 text-right text-sm">
                      <p>- descuento por codigo {discountPer}%</p>
                    </div>
                  )}
                  {serviceCharge && (
                    <div className="px-1 text-right text-sm">
                      <p>+ costo de servicio {serviceCharge}%</p>
                    </div>
                  )}
                </>
              ))}
            <p className="font-bold text-2xl text-right">
              TOTAL: $
              <span className="font-extrabold">
                {total.toLocaleString("es-ar")}
              </span>
            </p>
          </div>

          <Button
            className="w-full bg-red hover:bg-red-light hover:bg-opacity-10 hover:shadow-none transition-all rounded-none py-8 text-2xl border-4 border-black shadow-hard"
            type="submit"
            disabled={isLoading}
          >
            <span className={`${isLoading ? "hidden" : "block"} `}>
              Comprar
            </span>
            <span className={`${!isLoading ? "hidden" : "block"} `}>
              Comprando...
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
              className="w-full mt-4 bg-white font-bold rounded-none"
              type="button"
              onClick={() => setDiscountOpen(!discountOpen)}
              disabled={isLoading}
            >
              Tengo un código de descuento
            </Button>
            {discountOpen && (
              <div className="w-full mt-4">
                <form onSubmit={submitCode}>
                  <Input
                    className="w-full border-4 border-black rounded-none"
                    placeholder="Código de descuento"
                    name="discount-code"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="mt-4 inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-black w-full bg-yellow hover:bg-yellow-light hover:bg-opacity-10 hover:shadow-none transition-all rounded-none  border-4 border-black shadow-hard "
                    disabled={isLoading}
                  >
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
