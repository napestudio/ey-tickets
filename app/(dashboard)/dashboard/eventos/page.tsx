import { getAccessibleEvents } from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import EventsHandler from "./handler";
import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import NewEventButton from "../components/new-event-button/new-event-button";

export default async function EventosPage() {
  const session = await getSession();
  if (!session) return;
  const { id, producerId, role } = session.user;

  const eventos = await getAccessibleEvents({ id, producerId, role });

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-5">
          <DashboardHeader title="Eventos" subtitle="Listado de eventos" />
          {role !== "SELLER" && <NewEventButton />}
        </div>
        <div className="w-full space-y-5">
          <EventsHandler
            eventos={eventos as unknown as Evento[]}
            session={session}
          />
        </div>
      </div>
    </>
  );
}
