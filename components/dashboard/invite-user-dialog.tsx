"use client";

import type React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
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
import { OrganizationRole } from "@/types/user";
import { UserInvitation } from "@/types/user-invitations";
import { Session } from "next-auth";

const formSchema = z.object({
  email: z.string().email().min(5, { message: "Debe ser un email válido" }),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "SELLER"] as const, {
    required_error: "Debe seleccionar un rol",
  }),
  expiration: z.date(),
});

interface InviteCustomerDialogProps {
  userId: string;
  invitations: UserInvitation[];
  producerId: string;
  session: Session;
}

export function InviteUserDialog({
  invitations,
  userId,
  producerId,
  session,
}: InviteCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días a partir de hoy
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
    setSubmitError(null);

    createUserInvitation({
      email: values.email,
      role: values.role as OrganizationRole,
      token: uuidv4(),
      inviterId: userId,
      createdAt: today,
      expiresAt: values.expiration,
      producerId: producerId,
    })
      .then(() => {
        setOpen(false);
        setIsLoading(false);
        form.reset();
      })
      .catch((error: Error) => {
        setSubmitError(error.message || "Error enviando la invitación");
        setIsLoading(false);
      });
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

  const role = session.user.role;
  const isSuperAdmin = role === "SUPERADMIN";

  const allowedRoles =
    isSuperAdmin || role === "OWNER"
      ? ["ADMIN", "MANAGER", "SELLER"]
      : role === "ADMIN"
        ? ["MANAGER", "SELLER"]
        : [];

  if (!isSuperAdmin && (role === "SELLER" || role === "MANAGER")) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
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
                          {allowedRoles.includes("ADMIN") && (
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          )}
                          {allowedRoles.includes("MANAGER") && (
                            <SelectItem value="MANAGER">Manager</SelectItem>
                          )}
                          {allowedRoles.includes("SELLER") && (
                            <SelectItem value="SELLER">
                              Punto de venta / Vendedor
                            </SelectItem>
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
                              className={cn("w-60 pl-3 text-left font-normal")}
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
            {submitError && (
              <p className="text-sm text-red-500">{submitError}</p>
            )}
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
