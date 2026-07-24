import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { can } from "@/lib/permissions";
import { EventoWithTicketsType } from "@/types/event";
import MinimalEventSalesStats from "../mininimal-event-sales-stats";
import SideBar from "../event-details/side-bar";
import EventOverviewHeader from "./event-overview-header";
import EventActionGrid from "./event-action-grid";

export default async function EventOverview({
  evento,
}: {
  evento: EventoWithTicketsType;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  if (evento.status === "DELETED") {
    redirect("/dashboard");
  }

  const isEventOwner = can(session.user, "events:edit");

  return (
    <div className="space-y-6">
      <EventOverviewHeader evento={evento} isEventOwner={isEventOwner} />

      <div className="flex flex-col-reverse md:grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-5 space-y-6 w-full">
          <EventActionGrid
            baseHref={`/dashboard/evento/${evento.id}`}
            isEventOwner={isEventOwner}
          />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SideBar
            salesStats={<MinimalEventSalesStats eventId={evento.id} />}
          />
        </div>
      </div>
    </div>
  );
}
