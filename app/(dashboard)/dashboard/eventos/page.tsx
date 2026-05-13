import {
  getAllActiveEventByClientId,
  getAllEventByClientId,
  getAllEvents,
  getEventsBySellerId,
  getEventsByUserId,
} from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import EventsHandler from "./handler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function EventosPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const { id, type } = session.user;

  let eventos: any[];

  switch (type) {
    case "ADMIN":
    case "SUPERADMIN":
      eventos = await getAllEventByClientId();
      break;
    case "SELLER":
      eventos = await getEventsBySellerId(id);
      break;
    default:
      eventos = await getEventsByUserId(id);
      break;
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex gap-5">
          <DashboardHeader title="Eventos" subtitle="Listado de eventos" />
        </div>
        <div className="w-full space-y-5">
          <EventsHandler eventos={eventos as Evento[]} session={session} />
        </div>
      </div>
    </>
  );
}
