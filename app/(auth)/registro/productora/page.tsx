"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import { LocationSelect } from "@/components/website/LocationSelect";
import { EventCategory, EVENT_CATEGORY_LABELS } from "@/types/event";
import { Title } from "@/components/website/ui/Title";
import { inputClass } from "@/components/website/Contactform";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/ui/Logo";
import Link from "next/dist/client/link";

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

const ALL_CATEGORIES = Object.keys(EVENT_CATEGORY_LABELS) as EventCategory[];

export default function ProducerRegistrationPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepOneError, setStepOneError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    userConfirmPassword: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSelectChange(value: string) {
    setForm((prev) => ({ ...prev, producerVenueType: value }));
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
    setError(null);

    if (form.userPassword !== form.userConfirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

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
    <div className="min-h-screen bg-linear-to-b to-black from-ey-turquoise-darker to-80%">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-2 py-6 max-w-[200px]">
          <Logo />
        </Link>
      </div>

      <div className="container mx-auto py-14 flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col gap-4">
          <Title className="text-white font-bold uppercase text-[clamp(2.5rem,8vw,3.5rem)] leading-none">
            Registrá tu
            <br /> <span className="text-ey-turquoise">Productora</span>
          </Title>

          <p className="text-sm text-white">
            ¿Ya tenés una cuenta?
            <Link
              href="/ingresar"
              className="underline ml-4 text-ey-turquoise hover:underline hover:text-ey-turquoise-dark"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
        <div className="flex-1 md:max-w-lg">
          <Title as="h2" className="text-xl text-white mb-4">
            Paso {step} de 2 —{" "}
            {step === 1 ? "Datos de la productora" : "Tu cuenta"}
          </Title>
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-8 text-white">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="producerName">Nombre de la productora</Label>
                  <Input
                    id="producerName"
                    name="producerName"
                    required
                    value={form.producerName}
                    onChange={handleChange}
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="producerPhone">Teléfono (opcional)</Label>
                  <Input
                    id="producerPhone"
                    name="producerPhone"
                    value={form.producerPhone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <LocationSelect
                  provinceValue={form.producerState}
                  cityValue={form.producerCity}
                  onProvinceChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      producerState: value,
                      producerCity: "",
                    }))
                  }
                  onCityChange={(value) =>
                    setForm((prev) => ({ ...prev, producerCity: value }))
                  }
                />
                <div>
                  <Label htmlFor="producerVenueType">Tipo de espacio</Label>
                  <Select
                    //id="producerVenueType"
                    name="producerVenueType"
                    required
                    value={form.producerVenueType}
                    onValueChange={handleSelectChange}
                    //className="flex h-9 w-full rounded-2xl border-2 border-ey-turquoise bg-ey-dark px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <SelectTrigger className="bg-transparent text-xl py-6 border-2 border-ey-turquoise rounded-2xl">
                      <SelectValue placeholder={"Seleccioná un tipo"} />
                    </SelectTrigger>

                    <SelectContent className="bg-ey-dark border-2 border-ey-dark text-white">
                      {VENUE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Tipos de eventos que realizás{" "}
                    <span className="text-muted-foreground font-normal">
                      (al menos uno)
                    </span>
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {ALL_CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className={inputClass + " hidden peer"}
                          id={`cat-${cat}`}
                          checked={form.producerEventCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                        />
                        <label
                          htmlFor={`cat-${cat}`}
                          className="px-4 py-2 rounded-full text-sm cursor-pointer border-ey-turquoise border-2 peer-checked:bg-ey-turquoise peer-checked:text-ey-dark select-none transition-colors hover:bg-ey-turquoise/50 hover:text-ey-dark"
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

              <Button
                type="submit"
                className="w-full font-bold bg-ey-turquoise text-ey-dark rounded-2xl hover:bg-ey-turquoise-dark transition-colors cursor-pointer"
              >
                Siguiente
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8 text-white">
              <div className="space-y-3 w-full">
                <div>
                  <Label htmlFor="userName">Tu nombre</Label>
                  <Input
                    id="userName"
                    name="userName"
                    required
                    value={form.userName}
                    onChange={handleChange}
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="userPassword"
                      name="userPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.userPassword}
                      onChange={handleChange}
                      className={`${inputClass} pr-12`}
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
                </div>
                <div>
                  <Label htmlFor="userConfirmPassword">Repetir contraseña</Label>
                  <div className="relative">
                    <Input
                      id="userConfirmPassword"
                      name="userConfirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={form.userConfirmPassword}
                      onChange={handleChange}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent rounded-2xl text-white border-ey-turquoise cursor-pointer hover:bg-ey-turquoise/20 transition-colors"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  className="flex-1 rounded-2xl bg-ey-turquoise text-ey-dark cursor-pointer hover:bg-ey-turquoise-dark transition-colors font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Registrando..." : "Crear productora"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
