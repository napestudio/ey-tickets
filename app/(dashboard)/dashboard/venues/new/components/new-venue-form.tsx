"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVenueAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function NewVenueForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        const venue = await createVenueAction({ name: name.trim(), description: description.trim() || undefined });
        toast({ title: "Sala creada. Ahora podés diseñar el mapa." });
        router.push(`/dashboard/venues/${venue.id}/edit`);
      } catch (error) {
        toast({
          title: "Error al crear la sala",
          description: error instanceof Error ? error.message : "Intentá de nuevo.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nombre de la sala *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Teatro Municipal, Salón Principal"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción opcional de la sala"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isPending || !name.trim()} className="w-full gap-2">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear sala y diseñar mapa
      </Button>
    </form>
  );
}
