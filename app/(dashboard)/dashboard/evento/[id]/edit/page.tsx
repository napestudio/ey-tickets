import DashboardHeader from "@/components/dashboard/dashboard-header";
import EditEventForm from "@/components/dashboard/edit-event-form";
import { Button } from "@/components/ui/button";
import { getEventById, getRemainingTicketsByProducer } from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditEventTabs from "./edit-event-tabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { Evento } from "@/types/event";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function EditEventPage({
  params,
  searchParams,
}: EditEventPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) return;
  const evento = await getEventById(id);
  if (!evento) return;

  const { isSuperAdmin, role, producerId } = session.user;
  const isEventOwner = isSuperAdmin || isOrgAdmin(role);
  const activeTab = resolvedSearchParams.tab || "basic";
  if (!isEventOwner) redirect("/dashboard");

  const remainingTickets = await getRemainingTicketsByProducer(
    evento?.producerId || ""
  );

  return (
    <>
      <div className="space-y-6 pb-8">
        <DashboardHeader
          title={`Editar evento: ${evento?.title}`}
          subtitle="Edita toda la información de este evento"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/evento/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Evento
            </Link>
          </Button>
        </div>
        <EditEventTabs
          evento={{
            ...evento,
            ticketTypes: evento.ticketTypes?.map((t) => ({
              ...t,
              price: Number(t.price),
              discount: t.discount !== null ? Number(t.discount) : null,
            })),
          } as unknown as Evento}
          tab={activeTab}
          remainingTickets={remainingTickets}
        />
      </div>
    </>
  );
}
