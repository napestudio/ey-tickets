"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/website/ui/Button";
import { Paragraph } from "./ui/Paragraph";

const contactSchema = z.object({
  nombre: z.string().min(2, "Ingresá tu nombre"),
  apellido: z.string().min(2, "Ingresá tu apellido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(6, "Teléfono inválido"),
  asunto: z.enum(["cuenta", "evento", "pagos", "otro"], {
    required_error: "Seleccioná un tema",
  }),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const inputClass =
  "bg-transparent border-2 border-ey-turquoise rounded-2xl focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      mensaje: "",
    },
  });

  const { isSubmitting, isSubmitSuccessful } = form.formState;

  async function onSubmit(values: ContactFormValues) {
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
    } catch {
      form.setError("root", { message: "Hubo un error al enviar. Intentá de nuevo." });
    }
  }

  if (isSubmitSuccessful) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-8 text-center">
        <Paragraph className="text-2xl font-black uppercase mb-2">¡Mensaje enviado!</Paragraph>
        <Paragraph className="text-muted-foreground text-sm">
          Te respondemos a la brevedad.
        </Paragraph>
        <Button
          variant="primary"
          size="sm"
          className="mt-4 text-xs uppercase tracking-widest"
          onClick={() => form.reset()}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Nombre + Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder="Tu apellido" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email + Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="email" placeholder="vos@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="tel" placeholder="+54 9 11 0000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Asunto */}
        <FormField
          control={form.control}
          name="asunto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asunto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl className="bg-transparent border-2 border-ey-turquoise rounded-2xl">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná un tema" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cuenta">Mi cuenta</SelectItem>
                  <SelectItem value="evento">Mi evento</SelectItem>
                  <SelectItem value="pagos">Pagos y facturación</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mensaje */}
        <FormField
          control={form.control}
          name="mensaje"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Contanos en qué podemos ayudarte..."
                  rows={5}
                  className={`resize-none ${inputClass}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <Paragraph className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </Paragraph>
        )}

        <Button
          variant="primary"
          className="w-full text-ey-dark bg-ey-turquoise hover:bg-ey-turquoise-dark uppercase rounded-2xl"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </form>
    </Form>
  );
}