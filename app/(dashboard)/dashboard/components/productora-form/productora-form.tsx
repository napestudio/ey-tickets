"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { LocationSelect } from "@/components/location-select/location-select";
import { updateProducerDetailsAction } from "@/lib/actions";
import { uploadImage, deleteImage } from "@/lib/image-actions";
import { LogoUploader } from "@/app/(dashboard)/dashboard/components/logo-uploader/logo-uploader";

const FormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  logo: z.string().optional(),
  logoPublicId: z.string().nullish(),
});

type FormValues = z.infer<typeof FormSchema>;

type Producer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  city: string | null;
  logo: string | null;
  logoPublicId: string | null;
};

export default function ProductoraForm({ producer }: { producer: Producer }) {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileUpdated, setFileUpdated] = useState(false);
  const [logoPublicId, setLogoPublicId] = useState<string | null>(
    producer.logoPublicId ?? null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: producer.name,
      email: producer.email,
      phone: producer.phone ?? "",
      state: producer.state ?? "",
      city: producer.city ?? "",
      logo: producer.logo ?? "",
      logoPublicId: producer.logoPublicId ?? null,
    },
  });

  const handleDeleteLogo = async () => {
    if (logoPublicId) {
      await deleteImage(logoPublicId);
      setLogoPublicId(null);
    }
    setFiles([]);
    setFileUpdated(false);
    form.setValue("logo", "");
    form.setValue("logoPublicId", null);
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      if (fileUpdated && files.length > 0) {
        if (logoPublicId) {
          await deleteImage(logoPublicId);
        }
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadImage(formData, "producers", 300);
        if ("ok" in res) {
          throw new Error("Error subiendo el logo");
        }
        setLogoPublicId(res.publicId);
        setFileUpdated(false);
        data.logo = res.url;
        data.logoPublicId = res.publicId;
      }

      await updateProducerDetailsAction(producer.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        city: data.city,
        logo: data.logo,
        logoPublicId: data.logoPublicId ?? null,
      });
      toast({ title: "Datos actualizados correctamente" });
    } catch {
      toast({
        title: "Error al actualizar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium">Información general</h2>
      <p className="text-sm text-muted-foreground">
        Datos de contacto e información pública.
      </p>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo</FormLabel>
                <FormControl>
                  <LogoUploader
                    imageUrl={field.value ?? ""}
                    onFieldChange={field.onChange}
                    setFiles={setFiles}
                    setFileUpdated={setFileUpdated}
                    onDelete={handleDeleteLogo}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la productora" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contacto@productora.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <LocationSelect
            provinceValue={form.watch("state") ?? ""}
            cityValue={form.watch("city") ?? ""}
            onProvinceChange={(value) => form.setValue("state", value)}
            onCityChange={(value) => form.setValue("city", value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
