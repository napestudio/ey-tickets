import DashboardHeader from "@/components/dashboard/dashboard-header";
import EditTycketTypeForm from "@/app/(dashboard)/dashboard/components/edit-ticket-type-form/edit-ticket-type-form";
import { Button } from "@/components/ui/button";
import {
  getEventById,
  getRemainingTicketsForEvent,
  getTicketTypeWithSoldCount,
} from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { getUserEventRole } from "@/lib/api/event-members";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Editar tipo de ticket",
};

interface EditTicketTypePageProps {
  params: Promise<{ id: string; ticketTypeId: string }>;
}

export default async function EditTicketTypePage({
  params,
}: EditTicketTypePageProps) {
  const { id, ticketTypeId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return;
  const evento = await getEventById(id);
  if (!evento) return;

  const { role, id: userId } = session.user;

  if (!isOrgAdmin(role) && role !== "SUPERADMIN") {
    const membership = await getUserEventRole(userId, evento.id);
    if (!membership) redirect("/dashboard/eventos");
  }

  const [ticketType, remainingTickets] = await Promise.all([
    getTicketTypeWithSoldCount(ticketTypeId),
    getRemainingTicketsForEvent(evento.id, evento?.producerId || ""),
  ]);

  if (!ticketType) redirect(`/dashboard/evento/ticket-types/${id}`);

  const backHref = `/dashboard/evento/ticket-types/${id}`;

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader
        title={`Editar ticket: ${ticketType.title}`}
        subtitle={`Evento: ${evento.title}`}
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Tickets
          </Link>
        </Button>
      </div>
      <EditTycketTypeForm
        evento={evento as unknown as Evento}
        ticket={{
          ...ticketType,
          price: Number(ticketType.price),
          discount: ticketType.discount !== null ? Number(ticketType.discount) : null,
        } as unknown as TicketType}
        eventId={id}
        remainingTickets={remainingTickets}
        soldCount={ticketType.soldCount}
      />
    </div>
  );
}
