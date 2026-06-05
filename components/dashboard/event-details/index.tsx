import { Evento, EventoWithTicketsType } from "@/types/event";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

import DashboardHeader from "../dashboard-header";
import { can } from "@/lib/permissions";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getSoldTicketsByType,
} from "@/lib/actions";
import { getEventTicketAllocation } from "@/lib/api/ticket-stock";
import TicketsTab from "./tickets-tab";
import ValidatorsTab from "./validators-tab";
import DetailsTab from "./details-tab";
import Navigation from "./navigation";
import SideBar from "./side-bar";
import SoldTicketsTab from "./sold-tickets-tab";
import PaymentMethodsTab from "./payment-methods-tab";
import MinimalEventSalesStats from "../mininimal-event-sales-stats";
import AccionesTab from "./acciones-tab";

export default async function EventDetails({
  evento,
}: {
  evento: EventoWithTicketsType;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  if (evento.status === "DELETED") {
    redirect("/dashboard");
  }

  const { role, producerId } = session.user;

  const isEventOwner = can(session.user, "events:edit");
  const isSeller = role === "SELLER";

  const [
    soldTickets,
    eventAllocation,
  ] = await Promise.all([
    getSoldTicketsByType(evento.tickets || []),
    getEventTicketAllocation(evento.id),
  ]);

  return (
    <>
      <div className="space-y-6">
        <DashboardHeader
          title={evento.title}
          subtitle="Administra los datos de este evento"
        />
        <Navigation
          evento={evento}
          isEventOwner={isEventOwner}
          isSeller={isSeller}
        />
        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-5 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="overflow-x-auto max-w-[90vw] w-full">
                <TabsList>
                  <TabsTrigger value="overview">Detalles</TabsTrigger>
                  <TabsTrigger
                    value="tickets"
                    disabled={isSeller || !isEventOwner}
                  >
                    Tickets
                  </TabsTrigger>
                  <TabsTrigger
                    value="validators"
                    disabled={isSeller || !isEventOwner}
                  >
                    Validadores
                  </TabsTrigger>
                  <TabsTrigger
                    value="soldList"
                    disabled={isSeller || !isEventOwner}
                  >
                    Entradas Vendidas
                  </TabsTrigger>
                  <TabsTrigger
                    value="paymentMethods"
                    disabled={isSeller || !isEventOwner}
                  >
                    Métodos de pago
                  </TabsTrigger>
                  <TabsTrigger value="acciones">Acciones</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview" className="space-y-6">
                <DetailsTab
                  isEventOwner={isEventOwner}
                  isSeller={isSeller}
                  evento={evento as unknown as Evento}
                />
              </TabsContent>
              <TabsContent value="tickets" className="space-y-6">
                <TicketsTab evento={evento} />
              </TabsContent>
              <TabsContent value="validators" className="space-y-6">
                <ValidatorsTab evento={evento} />
              </TabsContent>
              <TabsContent value="soldList" className="space-y-6">
                <SoldTicketsTab evento={evento} />
              </TabsContent>
              <TabsContent value="paymentMethods" className="space-y-6">
                <PaymentMethodsTab evento={evento} session={session} />
              </TabsContent>
              <TabsContent value="acciones" className="space-y-6">
                <AccionesTab
                  evento={evento as unknown as Evento}
                  isSeller={isSeller}
                  isEventOwner={isEventOwner}
                  //remainingInvites={remainingInvites}
                  hasAllocation={!!eventAllocation}
                  //maxInvitesAmount={maxInvitesAmount}
                  soldTickets={soldTickets}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="md:col-span-2 space-y-6">
            <SideBar
              salesStats={<MinimalEventSalesStats eventId={evento.id} />}
              eventStockCap={eventAllocation?.quantity ?? null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
