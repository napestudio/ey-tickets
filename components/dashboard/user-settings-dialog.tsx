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
import { updateUserConfiguration } from "@/lib/actions";
import { toast } from "../ui/use-toast";
import { DialogTrigger } from "@radix-ui/react-dialog";

interface EditCustomerSettingsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  //   onSave: (settings: any) => void;
}

const formSchema = z.object({
  maxTickets: z.number(),
  maxInvites: z.number(),
});

export function UserSettingsDialog({
  user,
  open,
  onOpenChange,
}: EditCustomerSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxTickets: user.configuration?.maxTicketsAmount || 0,
      maxInvites: user.configuration?.maxInvitesAmount || 0,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        maxTickets: user.configuration?.maxTicketsAmount,
        maxInvites: user.configuration?.maxInvitesAmount,
      });
    }
  }, [user, form]);

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUserConfiguration(
      {
        maxInvitesAmount: data.maxInvites,
        maxTicketsAmount: data.maxTickets,
      },
      user.configuration?.id!,
      user.id!
    )
      .then(() => {
        setIsLoading(false);
        toast({
          title: "Configuración actualizada!",
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
                  name="maxTickets"
                  //   disabled={isLoading}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de tickets</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Ticket className="absolute right-3 h-5 w-5 top-3" />
                          <Input
                            placeholder="0"
                            maxLength={3}
                            {...field}
                            type="number"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Cantidad máxima de tickets que puede emitir en todos los
                        eventos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxInvites"
                  //   disabled={isLoading}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de invitaciones</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserPlus className="absolute right-3 h-5 w-5 top-3" />
                          <Input
                            placeholder="0"
                            maxLength={3}
                            {...field}
                            type="number"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Cantidad máxima de invitaciones que puede emitir en
                        todos los eventos.
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
