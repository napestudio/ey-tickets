"use client";

import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import Box from "@/components/dashboard/box";
import RichTextEditor from "@/components/dashboard/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCategory, EVENT_CATEGORY_LABELS } from "@/types/event";
import { WizardStep1Data } from "../create-event-wizard/types";

const schema = z.object({
  title: z.string().min(5, {
    message: "El titulo debe tener al menos 5 caracteres.",
  }),
  description: z.string(),
  category: z
    .enum([
      "MUSIC", "THEATER", "CONFERENCE", "SPORT", "ART", "GASTRONOMY",
      "COMEDY", "DANCE", "FESTIVAL", "CINEMA", "CORPORATE", "EXHIBITION",
      "NIGHTLIFE", "WORKSHOP", "OTHER",
    ])
    .nullish(),
  legalText: z.string().optional(),
  website: z.string().optional(),
  ageRestriction: z.coerce.number().int().positive().nullish(),
});

type Schema = z.infer<typeof schema>;

interface Props {
  initialData: WizardStep1Data;
  onSave: (data: WizardStep1Data) => Promise<void>;
}

export function EditStep1Datos({ initialData, onSave }: Props) {
  const [restrictions, setRestrictions] = useState<string[]>(
    initialData.restrictions
  );
  const [savedRestrictions, setSavedRestrictions] = useState<string[]>(
    initialData.restrictions
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description,
      category: initialData.category,
      legalText: initialData.legalText,
      website: initialData.website,
      ageRestriction: initialData.ageRestriction,
    },
  });

  const restrictionsChanged =
    JSON.stringify(restrictions) !== JSON.stringify(savedRestrictions);
  const isDirty = form.formState.isDirty || restrictionsChanged;

  const handleAddRestriction = () => setRestrictions([...restrictions, ""]);

  const handleRestrictionChange = (index: number, value: string) => {
    const updated = [...restrictions];
    updated[index] = value;
    setRestrictions(updated);
  };

  const handleRemoveRestriction = (index: number) =>
    setRestrictions(restrictions.filter((_, i) => i !== index));

  async function onSubmit(values: Schema) {
    setIsSaving(true);
    try {
      const filtered = restrictions.filter((r) => r.trim() !== "");
      await onSave({
        title: values.title,
        description: values.description,
        category: values.category ?? null,
        legalText: values.legalText ?? "",
        website: values.website ?? "",
        restrictions: filtered,
        ageRestriction: values.ageRestriction ?? null,
      });
      form.reset(values);
      setSavedRestrictions(filtered);
    } catch {
      // Error handled by wizard
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Datos del evento</h2>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Titulo del evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Box>

        <Box>
          <div className="space-y-4">
            <h2 className="font-bold">Categoría</h2>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[]
                      ).map((key) => (
                        <SelectItem key={key} value={key}>
                          {EVENT_CATEGORY_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Box>

        <Box>
          <button
            type="button"
            onClick={() => setShowExtras((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <h2 className="font-bold">Extras</h2>
            {showExtras ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {showExtras && (
            <div className="mt-4 space-y-6">
              <FormField
                control={form.control}
                name="legalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Texto legal{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Términos y condiciones, texto legal del evento..."
                        className="min-h-30 resize-y"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sitio web{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.mievento.com"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>
                  Restricciones de acceso{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FormLabel>
                {restrictions.map((restriction, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={restriction}
                      placeholder="Ej: Mayores de 18 años"
                      onChange={(e) =>
                        handleRestrictionChange(index, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRestriction(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddRestriction}
                >
                  + Agregar restricción
                </Button>
              </div>

              <FormField
                control={form.control}
                name="ageRestriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Edad mínima{" "}
                      <span className="text-muted-foreground font-normal">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        placeholder="Ej: 18"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </Box>

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
