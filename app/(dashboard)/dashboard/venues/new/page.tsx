import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { NewVenueForm } from "./components/new-venue-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewVenuePage() {
  const session = await getSession();
  if (!session?.user?.producerId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 md:px-6">
        <Link
          href="/dashboard/venues"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Mapas
        </Link>
        <DashboardHeader
          title="Nuevo mapa"
          subtitle="Configurá los datos básicos del mapa"
        />
      </div>

      <div className="px-4 md:px-6 max-w-lg">
        <NewVenueForm />
      </div>
    </div>
  );
}
