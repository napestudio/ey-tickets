import { getSession } from "@/lib/auth/get-session";

import { CreateEventWizard } from "@/app/(dashboard)/dashboard/components/create-event-wizard/create-event-wizard";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { getProducerById } from "@/lib/api/producers";

export default async function NewEvent() {
  const session = await getSession();
  if (!session) return;
  const producerId = session.user.producerId || "";
  const producer = producerId ? await getProducerById(producerId) : null;
  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader title="Nuevo evento" subtitle="Crea un evento nuevo" />
        <div>
          <CreateEventWizard
            producerId={producerId}
            producerState={producer?.state ?? undefined}
            producerCity={producer?.city ?? undefined}
          />
        </div>
      </div>
    </>
  );
}
