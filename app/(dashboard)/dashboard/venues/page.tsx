import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getVenuesByProducerId } from "@/lib/api/venues";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Map } from "lucide-react";
import { VenueListClient } from "./components/venue-list-client";

export default async function VenuesPage() {
  const session = await getSession();
  if (!session?.user?.producerId) redirect("/dashboard");

  const venues = await getVenuesByProducerId(session.user.producerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between px-4 md:px-6 gap-4">
        <DashboardHeader
          title="Mapas"
          subtitle="Gestioná los mapas de venue de tu productora"
        />
        <Link href="/dashboard/venues/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo mapa
          </Button>
        </Link>
      </div>

      <div className="px-4 md:px-6">
        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Map className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No hay mapas creados todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                Creá tu primer mapa para poder vender entradas numeradas
              </p>
            </div>
            <Link href="/dashboard/venues/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear mapa
              </Button>
            </Link>
          </div>
        ) : (
          <VenueListClient venues={venues} />
        )}
      </div>
    </div>
  );
}
