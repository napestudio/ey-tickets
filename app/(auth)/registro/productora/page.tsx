"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationSelect } from "@/components/location-select/location-select";
import { EventCategory } from "@/types/event";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const VENUE_TYPE_OPTIONS = [
  { value: "BAR", label: "Bar" },
  { value: "TEATRO", label: "Teatro" },
  { value: "SALON_DE_EVENTOS", label: "Salón de eventos" },
  { value: "ANFITEATRO", label: "Anfiteatro" },
  { value: "BOLICHE", label: "Boliche" },
  { value: "CENTRO_DE_CONVENCIONES", label: "Centro de convenciones" },
  { value: "ESTADIO", label: "Estadio" },
  { value: "CLUB_SOCIAL", label: "Club social" },
  { value: "ESPACIO_CULTURAL", label: "Espacio cultural" },
  { value: "OTRO", label: "Otro" },
] as const;

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  MUSIC: "Música",
  THEATER: "Teatro",
  CONFERENCE: "Conferencia",
  SPORT: "Deporte",
  ART: "Arte",
  GASTRONOMY: "Gastronomía",
  COMEDY: "Comedia",
  DANCE: "Danza",
  FESTIVAL: "Festival",
  CINEMA: "Cine",
  CORPORATE: "Corporativo",
  EXHIBITION: "Exposición",
  NIGHTLIFE: "Vida nocturna",
  WORKSHOP: "Taller",
  OTHER: "Otro",
};

const ALL_CATEGORIES = Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[];

export default function ProducerRegistrationPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepOneError, setStepOneError] = useState<string | null>(null);

  const [form, setForm] = useState({
    producerName: "",
    producerEmail: "",
    producerPhone: "",
    producerState: "",
    producerCity: "",
    producerVenueType: "",
    producerEventCategories: [] as EventCategory[],
    userName: "",
    userEmail: "",
    userPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleCategory(category: EventCategory) {
    setForm((prev) => {
      const has = prev.producerEventCategories.includes(category);
      return {
        ...prev,
        producerEventCategories: has
          ? prev.producerEventCategories.filter((c) => c !== category)
          : [...prev.producerEventCategories, category],
      };
    });
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setStepOneError(null);

    if (!form.producerName || !form.producerEmail || !form.producerVenueType) {
      setStepOneError("Completá todos los campos requeridos.");
      return;
    }
    if (form.producerEventCategories.length === 0) {
      setStepOneError("Seleccioná al menos un tipo de evento.");
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registro/productora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producer: {
            name: form.producerName,
            slug: generateSlug(form.producerName),
            email: form.producerEmail,
            phone: form.producerPhone,
            state: form.producerState || null,
            city: form.producerCity || null,
            venueType: form.producerVenueType || null,
            eventCategories: form.producerEventCategories,
          },
          owner: {
            name: form.userName,
            email: form.userEmail,
            password: form.userPassword,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al registrar la productora");
        return;
      }

      await signIn("credentials", {
        email: form.userEmail,
        password: form.userPassword,
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Registrá tu Productora</CardTitle>
          <p className="text-sm text-muted-foreground">
            Paso {step} de 2 —{" "}
            {step === 1 ? "Datos de la productora" : "Tu cuenta"}
          </p>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="producerName">Nombre de la productora</Label>
                  <Input
                    id="producerName"
                    name="producerName"
                    required
                    value={form.producerName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="producerEmail">Email de la productora</Label>
                  <Input
                    id="producerEmail"
                    name="producerEmail"
                    type="email"
                    required
                    value={form.producerEmail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="producerPhone">Teléfono (opcional)</Label>
                  <Input
                    id="producerPhone"
                    name="producerPhone"
                    value={form.producerPhone}
                    onChange={handleChange}
                  />
                </div>
                <LocationSelect
                  provinceValue={form.producerState}
                  cityValue={form.producerCity}
                  onProvinceChange={(value) =>
                    setForm((prev) => ({ ...prev, producerState: value, producerCity: "" }))
                  }
                  onCityChange={(value) =>
                    setForm((prev) => ({ ...prev, producerCity: value }))
                  }
                />
                <div>
                  <Label htmlFor="producerVenueType">Tipo de espacio</Label>
                  <select
                    id="producerVenueType"
                    name="producerVenueType"
                    required
                    value={form.producerVenueType}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Seleccioná un tipo</option>
                    {VENUE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Tipos de eventos que realizás{" "}
                    <span className="text-muted-foreground font-normal">
                      (al menos uno)
                    </span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={form.producerEventCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <label
                          htmlFor={`cat-${cat}`}
                          className="text-sm cursor-pointer"
                        >
                          {EVENT_CATEGORY_LABELS[cat]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {stepOneError && (
                <p className="text-sm text-red-600">{stepOneError}</p>
              )}

              <Button type="submit" className="w-full">
                Siguiente
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="userName">Tu nombre</Label>
                  <Input
                    id="userName"
                    name="userName"
                    required
                    value={form.userName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">
                    Tu email{" "}
                    <span className="text-muted-foreground font-normal">
                      (lo usás para ingresar)
                    </span>
                  </Label>
                  <Input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    required
                    value={form.userEmail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Contraseña</Label>
                  <Input
                    id="userPassword"
                    name="userPassword"
                    type="password"
                    required
                    minLength={8}
                    value={form.userPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Registrando..." : "Crear productora"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
