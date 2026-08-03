import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";
import { can } from "@/lib/permissions";
import { Evento } from "@/types/event";
import EventOverviewHeader from "./event-overview-header";
import EventActionGrid from "./event-action-grid";

export default async function EventOverview({
  evento,
}: {
  evento: Evento;
}) {
  const session = await getSession();
  if (!session) return null;

  if (evento.status === "DELETED") {
    redirect("/dashboard");
  }

  const isEventOwner = can(session.user, "events:edit");

  return (
    <div className="space-y-6">
      <EventOverviewHeader evento={evento} isEventOwner={isEventOwner} />
      <EventActionGrid
        baseHref={`/dashboard/evento/${evento.id}`}
        isEventOwner={isEventOwner}
      />
    </div>
  );
}
