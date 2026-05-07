"use client";

import type React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ReactNode, useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toZonedTime } from "date-fns-tz";
import { createUserInvitation } from "@/lib/actions";
import { UserType } from "@/types/user";
import { UserInvitation } from "@/types/user-invitations";
import { Session } from "next-auth";

const formSchema = z.object({
  email: z.string().email().min(5, { message: "Debe ser un email válido" }),
  role: z.enum(["SELLER", "PRODUCER", "ADMIN", "SUPERADMIN"] as const, {
    required_error: "Debe seleccionar un rol",
  }),
  expiration: z.date(),
});

interface InviteCustomerDialogProps {
  children: ReactNode;
  userId: string;
  invitations: UserInvitation[];
  clientId: string;
  session: Session;
}

export function InviteUserDialog({
  children,
  invitations,
  userId,
  clientId,
  session,
}: InviteCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días a partir de hoy
  );

  const timeZone = "America/Argentina/Buenos_Aires";
  const today = toZonedTime(new Date(), timeZone);
  const tomorrow = addDays(today, 1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: undefined,
      expiration: tomorrow,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // const emailExists = invitations.some(
    //   (invitation) => invitation.email === values.email
    // );

    // if (emailExists) {
    //   toast({
    //     variant: "destructive",
    //     title: "Error en la invitación",
    //     description: "El email ya ha sido invitado anteriormente.",
    //   });
    //   form.reset();
    //   setIsLoading(false);
    //   return;
    // }

    createUserInvitation({
      email: values.email,
      role: values.role as UserType,
      token: uuidv4(),
      inviterId: userId,
      createdAt: today,
      expiresAt: values.expiration,
      clientId: clientId,
    })
      .then(() => {
        // toast({
        //   title: "Usuario invitado!",
        // });
        setOpen(false);
        setIsLoading(false);
      })
      .catch((error) => {
        // toast({
        //   variant: "destructive",
        //   title: "Error en la invitación",
        // });
        setOpen(false);
        setIsLoading(false);
      });
    form.reset();
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   console.log("Invitation sent:", {
  //     email,
  //     role,
  //     expirationDate,
  //   });

  //   setIsSubmitting(false);
  //   setOpen(false);
  //   resetForm();
  // };

  const allowedRoles =
    session.user.type === "SUPERADMIN"
      ? ["ADMIN", "PRODUCER", "SELLER"]
      : session.user.type === "ADMIN"
      ? ["PRODUCER", "SELLER"]
      : session.user.type === "PRODUCER"
      ? ["SELLER"]
      : [];

  if (session.user.type === "SELLER") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSubmit(values))}
            className="space-y-8 w-full"
          >
            <DialogHeader>
              <DialogTitle className="text-left">
                Invitar nuevo Usuario
              </DialogTitle>
              <DialogDescription className="text-left">
                Invitar a nuevo usuario a la plataforma. Los nuevos usuarios
                reciben un e-mail con la invitación. Una vez aceptada podrán
                ingresar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedRoles.includes("SELLER") && (
                            <SelectItem value="SELLER">
                              Punto de venta / Vendedor
                            </SelectItem>
                          )}
                          {allowedRoles.includes("PRODUCER") && (
                            <SelectItem value="PRODUCER">Productor</SelectItem>
                          )}
                          {allowedRoles.includes("ADMIN") && (
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="expiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expira el</FormLabel>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Vencimiento</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        La invitación será invalida después de esta fecha.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar invitación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
