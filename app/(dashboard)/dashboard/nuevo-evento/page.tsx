import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { CreateEventWizard } from "@/app/(dashboard)/dashboard/components/create-event-wizard/create-event-wizard";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function NewEvent() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const producerId = session.user.producerId || "";
  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader title="Nuevo evento" subtitle="Crea un evento nuevo" />
        <div>
          <CreateEventWizard producerId={producerId} />
        </div>
      </div>
    </>
  );
}
