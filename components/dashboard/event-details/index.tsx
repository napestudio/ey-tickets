import { Evento, EventoWithTicketsType } from "@/types/event";

import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { datesFormater } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

import DashboardHeader from "../dashboard-header";
import { can } from "@/lib/permissions";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getSoldTicketsByType,
  getUsedInvitesByProducer,
  getMaxInvitesPerEvent,
} from "@/lib/actions";
import {
  getProducerStockSummary,
  getEventTicketAllocation,
} from "@/lib/api/ticket-stock";
import TicketsTab from "./tickets-tab";
import ValidatorsTab from "./validators-tab";
import DetailsTab from "./details-tab";
import Navigation from "./navigation";
import SideBar from "./side-bar";
import SoldTicketsTab from "./sold-tickets-tab";
import PaymentMethodsTab from "./payment-methods-tab";
import MinimalEventSalesStats from "../mininimal-event-sales-stats";
export default async function EventDetails({
  evento,
}: {
  evento: EventoWithTicketsType;
}) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const groupedDates = datesFormater(evento.dates as string);
  if (evento.status === "DELETED") {
    redirect("/dashboard");
  }

  const { role, producerId } = session.user;

  const isEventOwner = can(session.user, "events:edit");
  const isSeller = role === "SELLER";

  const [
    maxInvitesAmount,
    usedInvites,
    soldTickets,
    stockSummary,
    eventAllocation,
  ] = await Promise.all([
    getMaxInvitesPerEvent(producerId ?? ""),
    getUsedInvitesByProducer(producerId ?? ""),
    getSoldTicketsByType(evento.tickets || []),
    getProducerStockSummary(producerId ?? ""),
    getEventTicketAllocation(evento.id),
  ]);

  const remaingingTickets = stockSummary.unallocated;
  const remainingInvites = maxInvitesAmount - usedInvites;
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
            <Card>
              <div className="relative h-45 md:h-75 bg-neutral-300 w-full">
                {evento.image && (
                  <Image
                    src={evento.image}
                    alt={evento.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                )}
              </div>
            </Card>

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
                </TabsList>
              </div>
              <TabsContent value="overview" className="space-y-6">
                <DetailsTab
                  isEventOwner={isEventOwner}
                  isSeller={isSeller}
                  evento={evento}
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
            </Tabs>
          </div>
          <div className="md:col-span-2 space-y-6">
            <SideBar
              evento={evento}
              isEventOwner={isEventOwner}
              isSeller={isSeller}
              remainingInvites={remainingInvites}
              remainingTickets={remaingingTickets}
              maxInvitesAmount={maxInvitesAmount}
              salesStats={<MinimalEventSalesStats eventId={evento.id} />}
              soldTickets={soldTickets}
              eventStockCap={eventAllocation?.quantity ?? null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
