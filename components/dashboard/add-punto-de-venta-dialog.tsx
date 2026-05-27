"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import { User } from "@/types/user";
import { Session } from "next-auth";
import { createPuntoDeVenta } from "@/lib/actions";

const puntoDeVentaSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  seller: z.string().min(1, "Seleccioná un vendedor"),
  enabled: z.boolean().default(true),
});

type PuntoDeVentaForm = z.infer<typeof puntoDeVentaSchema>;

interface AddPuntoDeVentaDialogProps {
  sellers?: User[];
  session: Session;
}

export function AddPuntoDeVentaDialog({
  sellers,
  session,
}: AddPuntoDeVentaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PuntoDeVentaForm>({
    resolver: zodResolver(puntoDeVentaSchema),
    defaultValues: {
      name: "",
      seller: "",
      enabled: true,
    },
  });

  const onSubmit = async (data: PuntoDeVentaForm) => {
    setIsSubmitting(true);
    try {
      await createPuntoDeVenta({
        name: data.name,
        type: "CASH",
        producerId: session.user.producerId!,
        userId: data.seller,
        enabled: data.enabled,
        creatorId: session.user.id,
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creando punto de venta", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo punto de venta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <DialogHeader className="text-left">
              <DialogTitle>Agregar Punto de Venta</DialogTitle>
              <DialogDescription>
                Crea un nuevo punto de venta y asígnale un vendedor
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Card>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del punto de venta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Caja 1, Entrada principal..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Este nombre identifica el punto de venta.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seller"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendedor asignado</FormLabel>
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
                              <SelectItem key={seller.id} value={seller.id!}>
                                {seller.email}
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
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Habilitado</FormLabel>
                          {/* <FormDescription>
                            Una vez habilitado, este punto de venta estará
                            disponible para su uso.
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !sellers?.length}>
                {isSubmitting ? "Agregando..." : "Agregar punto de venta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
