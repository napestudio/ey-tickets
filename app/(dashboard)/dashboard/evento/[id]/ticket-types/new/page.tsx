import DashboardHeader from "@/components/dashboard/dashboard-header";
import TycketTypeForm from "@/app/(dashboard)/dashboard/components/ticket-type-form/ticket-type-form";
import { Button } from "@/components/ui/button";
import { getEventById, getRemainingTicketsForEvent } from "@/lib/actions";
import { isOrgAdmin } from "@/lib/permissions";
import { getUserEventRole } from "@/lib/api/event-members";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { redirect } from "next/navigation";
import { Evento } from "@/types/event";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Nuevo tipo de ticket",
};

interface NewTicketTypePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewTicketTypePage({
  params,
}: NewTicketTypePageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return;
  const evento = await getEventById(id);
  if (!evento) return;

  const { role, id: userId } = session.user;

  if (!isOrgAdmin(role) && role !== "SUPERADMIN") {
    const membership = await getUserEventRole(userId, evento.id);
    if (!membership) redirect("/dashboard/eventos");
  }

  const remainingTickets = await getRemainingTicketsForEvent(
    evento.id,
    evento?.producerId || ""
  );

  const backHref = `/dashboard/evento/ticket-types/${id}`;

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader
        title="Nuevo tipo de ticket"
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
      <TycketTypeForm
        evento={evento as unknown as Evento}
        remainingTickets={remainingTickets}
        redirectTo={backHref}
      />
    </div>
  );
}
