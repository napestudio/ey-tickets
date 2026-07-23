import { getServerSession } from "next-auth";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import PaymentMethodsTab from "@/components/dashboard/event-details/payment-methods-tab";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { getEventById } from "@/lib/actions";
import { Evento } from "@/types/event";
import { ArrowLeft } from "lucide-react";

export default async function MetodosDePagoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [evento, session] = await Promise.all([
    getEventById(id),
    getServerSession(authOptions),
  ]);

  if (!evento || !session) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={evento.title}
        subtitle="Métodos de pago del evento"
      />
      <Button variant="outline" size="sm" asChild>
        <Link href={`/dashboard/evento/${id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al evento
        </Link>
      </Button>
      <PaymentMethodsTab
        evento={evento as unknown as Evento}
        session={session}
      />
    </div>
  );
}
