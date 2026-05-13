"use client";

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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { createValidatorToken } from "@/lib/actions";
import { Dices, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  notes: z.string().max(200, "No puede exceder los 200 caracteres").optional(),
});

function generateRandomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@!";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function NewTokenDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState<boolean>(false);
  const [randomCode, setRandomCode] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  });

  useEffect(() => {
    setRandomCode(generateRandomCode());
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      createValidatorToken({
        token: randomCode,
        notes: values.notes || "",
        eventId,
      });
      toast({
        title: "Token de validación creado",
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creando el Token de validación",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo token</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">{randomCode}</div>
          <Button
            type="button"
            variant="outline"
            size={"sm"}
            onClick={() => setRandomCode(generateRandomCode())}
          >
            <Dices />
          </Button>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values: any) => onSubmit(values))}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Input placeholder="Notas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <DialogFooter>
              <Button type="submit" className="w-full">
                Crear Token
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
