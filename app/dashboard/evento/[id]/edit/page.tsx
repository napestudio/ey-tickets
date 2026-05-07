import DashboardHeader from "@/components/dashboard/dashboard-header";
import EditEventForm from "@/components/dashboard/edit-event-form";
import { Button } from "@/components/ui/button";
import { getEventById, getRemainingTicketsByUser } from "@/lib/actions";
import { EventStatus } from "@/types/event";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditEventTabs from "./edit-event-tabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { User } from "@/types/user";
import { DiscountCode } from "@/types/discount-code";
import { TicketType } from "@/types/tickets";
import { ValidatorToken } from "@/types/validators";
import { EventPayment } from "@prisma/client";

interface EditEventPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export interface Evento {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  userId: string;
  image: string;
  dates: string;
  status?: EventStatus;
  user?: User;
  discountCode?: DiscountCode[] | undefined;
  ticketTypes?: TicketType[];
}

export default async function EditEventPage({
  params,
  searchParams,
}: EditEventPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const evento = await getEventById(params.id);
  if (!evento) return;
  const isEventOwner =
    session.user.id === evento.userId ||
    session.user.type === "ADMIN" ||
    session.user.type === "SUPERADMIN";
  const activeTab = searchParams.tab || "basic";
  if (session.user.type === "SELLER" || !isEventOwner) redirect("/dashboard");

  const remainingTickets = await getRemainingTicketsByUser(
    evento?.userId || ""
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
            <Link href={`/dashboard/evento/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Evento
            </Link>
          </Button>
        </div>
        <EditEventTabs
          evento={evento as Evento}
          tab={activeTab}
          remainingTickets={remainingTickets}
        />
      </div>
    </>
  );
}
