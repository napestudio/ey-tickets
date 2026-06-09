import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getProducerById } from "@/lib/api/producers";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Propietario",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

export default async function Perfil() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { name, email, image, role, producerId } = session.user;

  const producer = producerId ? await getProducerById(producerId) : null;

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const roleLabel = ROLE_LABELS[role ?? ""] ?? role ?? "—";

  return (
    <div>
      <h2 className="text-lg font-medium">Perfil</h2>
      <p className="text-sm text-muted-foreground">
        Tus datos de usuario. Estos datos no son públicos.
      </p>
      <Separator className="my-4" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-base">{name ?? "—"} </p>{" "}
              <Badge variant="secondary">{roleLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{email ?? "—"}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-3">Información de la cuenta</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <dt className="text-xs text-muted-foreground">Nombre</dt>
              <dd className="mt-1 text-sm font-medium">{name ?? "—"}</dd>
            </div>
            <div className="rounded-md border p-4">
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm font-medium">{email ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {producer && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3">Productora</h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <dt className="text-xs text-muted-foreground">Nombre</dt>
                  <dd className="mt-1 text-sm font-medium">{producer.name}</dd>
                </div>
                <div className="rounded-md border p-4">
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm font-medium">{producer.email}</dd>
                </div>
                {producer.website && (
                  <div className="rounded-md border p-4">
                    <dt className="text-xs text-muted-foreground">Sitio web</dt>
                    <dd className="mt-1 text-sm font-medium">
                      {producer.website}
                    </dd>
                  </div>
                )}
                {(producer.city || producer.state) && (
                  <div className="rounded-md border p-4">
                    <dt className="text-xs text-muted-foreground">Ubicación</dt>
                    <dd className="mt-1 text-sm font-medium">
                      {[producer.city, producer.state]
                        .filter(Boolean)
                        .join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
