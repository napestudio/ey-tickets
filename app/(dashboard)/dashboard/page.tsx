import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { Evento } from "@/types/event";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import EventsDisplay from "@/components/dashboard/events-display";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getAccessibleEvents } from "@/lib/api/eventos";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const { id, isSuperAdmin, producerId, role } = session.user;

  const eventos = await getAccessibleEvents({ id, isSuperAdmin, producerId, role });
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex gap-5">
          <DashboardHeader
            title="Dashboard"
            subtitle="Administra tus eventos y venta de tickets"
          />
        </div>
        <div className="w-full space-y-5">
          {/* <StatsCards /> */}
          <EventsDisplay eventos={eventos as Evento[]} session={session} />

          {eventos.length === 0 && (
            <Card className="p-6">
              <CardContent>No hay eventos creados.</CardContent>
              <CardFooter>
                <Button asChild variant="secondary">
                  <Link href={"/dashboard/nuevo-evento"}>
                    <Plus className="mr-2" /> Crear evento
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
