"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Loader2, PercentCircle, Ticket, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  updateUser,
  updateUserById,
  updateUserConfiguration,
} from "@/lib/actions";
import { toast } from "../ui/use-toast";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditCustomerSettingsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  role: z.enum(["SELLER", "PRODUCER", "ADMIN", "SUPERADMIN"] as const, {
    required_error: "Debe seleccionar un rol",
  }),
});
export function UserRoleDialog({
  user,
  open,
  onOpenChange,
}: EditCustomerSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        role: user.type,
      });
    }
  }, [user, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUserById(
      {
        type: data.role,
      },
      user.id!
    )
      .then(() => {
        setIsLoading(false);
        toast({
          title: "Rol actualizad!",
        });
        onOpenChange(false);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error actualizando",
        });
        setIsLoading(false);
        onOpenChange(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader className="text-left">
              <DialogTitle>Editar limites del usuario {user.name}</DialogTitle>
              <DialogDescription>
                Configura los limites del usuario
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-4">
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
                          <SelectItem value="PRODUCER">Productor</SelectItem>
                          <SelectItem value="SELLER">
                            Punto de venta / Vendedor
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar configuración"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
