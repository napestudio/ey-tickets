"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { confirmNewPassword } from "@/lib/actions";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});
export default function NewPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const resp = await confirmNewPassword(values.password, token);
    if (resp?.ok === false) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error actualizando el password",
      });
    }
    setIsLoading(false);
    toast({
      title: "Password",
      description: "Se ha actualizado el password con éxito",
    });
    router.push(`/ingresar/`);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-8 w-full"
        autoComplete="false"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={!showPassword ? `password` : "text"}
                    placeholder="Tu contraseña"
                    {...field}
                    autoComplete="false"
                  />
                  <Eye
                    className="absolute right-3 top-2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repetir Contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={!showPassword ? `password` : "text"}
                    placeholder="Repeti la contraseña"
                    {...field}
                    autoComplete="false"
                  />
                  <Eye
                    className="absolute right-3 top-2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Ingresar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
