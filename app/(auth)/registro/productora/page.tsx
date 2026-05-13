"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ProducerRegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    producerName: "",
    producerEmail: "",
    producerPhone: "",
    userName: "",
    userEmail: "",
    userPassword: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

      router.push("/ingresar");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registrá tu Productora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Datos de la Productora
              </h3>
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
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tu cuenta (Owner)
              </h3>
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
                <Label htmlFor="userEmail">Tu email</Label>
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

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Crear Productora"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
