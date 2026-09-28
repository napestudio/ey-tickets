"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useEffect, useState } from "react";
import { inputClass } from "@/components/website/Contactform";

const formSchema = z.object({
  email: z.string().email({ message: "Debe ser un email válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

const responseTxt: {
  [key: string]: string;
} = {
  AccessDenied: "Usuario inválido",
  CredentialsSignin: "Usuario o contraseña incorrecto",
};

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setFormError(
        responseTxt[errorParam] ?? "No se pudo iniciar sesión. Intentá de nuevo."
      );
    }
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setFormError(null);

    try {
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: true,
      });
    } catch (error) {
      console.log(error);
      setFormError("No se pudo iniciar sesión. Intentá de nuevo.");
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-8 w-full text-white"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl className="text-xl py-6 rounded-none">
                <Input className={inputClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl className="">
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-12`}
                    type={showPassword ? "text" : "password"}
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formError && (
          <p className="text-sm font-medium text-red-400" role="alert">
            {formError}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full font-bold text-ey-dark bg-ey-turquoise hover:bg-ey-turquoise-dark uppercase rounded-2xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
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
