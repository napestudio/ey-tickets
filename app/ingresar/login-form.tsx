"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Debe ser un email válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

const responseTxt: {
  [key: string]: string
} = {
  AccessDenied: "Usuario inválido",
  CredentialsSignin: "Usuario o contraseña incorrecto",
}

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessageShown, setErrorMessageShown] = useState<boolean>(false); // Control del toast
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();
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
    if (!urlError && errorParam) {
      setUrlError(errorParam);
    }
  }, [searchParams, urlError]);

  useEffect(() => {
    if (urlError && !errorMessageShown) {
      setErrorMessageShown(true);
      toast({
        variant: "destructive",
        title: responseTxt[urlError],
      });
    }
  }, [urlError, errorMessageShown]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const resp = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: true,
      });

      if (resp?.ok === false) {
        setIsLoading(false);
        return toast({
          variant: "destructive",
          title: "Password o email son incorrectos.",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
        className="space-y-8 w-full"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl className="border-4 border-black rounded-none">
                <Input placeholder="Tu E-mail" {...field} />
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
              <FormControl className="border-4 border-black rounded-none">
                <Input type="password" placeholder="Tu contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isLoading} className="w-full bg-red hover:bg-red-light hover:bg-opacity-10 hover:shadow-none transition-all rounded-none py-8 text-2xl border-4 border-black shadow-hard"
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
