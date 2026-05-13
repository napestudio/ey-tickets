import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import CreateEventForm from "../../../components/dashboard/create-event-form";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewEvent() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const id = session.user.id;
  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader title="Nuevo evento" subtitle="Crea un evento nuevo" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
        <div>
          <CreateEventForm userId={id} />
        </div>
      </div>
    </>
  );
}
