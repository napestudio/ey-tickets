import { getAccessibleEvents } from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import EventsHandler from "./handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function EventosPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const { id, isSuperAdmin, producerId, role } = session.user;

  const eventos = await getAccessibleEvents({ id, isSuperAdmin, producerId, role });

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex gap-5">
          <DashboardHeader title="Eventos" subtitle="Listado de eventos" />
        </div>
        <div className="w-full space-y-5">
          <EventsHandler eventos={eventos as unknown as Evento[]} session={session} />
        </div>
      </div>
    </>
  );
}
