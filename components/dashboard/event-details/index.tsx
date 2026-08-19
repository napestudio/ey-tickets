import { Evento, EventoWithTicketsType } from "@/types/event";

import { TabsContent } from "../../ui/tabs";

import { can } from "@/lib/permissions";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import TicketsTab from "./tickets-tab";
import ValidatorsTab from "./validators-tab";
import DetailsTab from "./details-tab";
import Navigation from "./navigation";
import SideBar from "./side-bar";
import SoldTicketsTab from "./sold-tickets-tab";
import PaymentMethodsTab from "./payment-methods-tab";
import MinimalEventSalesStats from "../mininimal-event-sales-stats";
import AccionesTab from "./acciones-tab";
import InvitadosTab from "./invitados-tab";
import EventTabsClient from "./event-tabs-client";

const VALID_TABS = [
  "overview",
  "tickets",
  "validators",
  "soldList",
  "invitados",
  "paymentMethods",
  "acciones",
] as const;

type TabValue = (typeof VALID_TABS)[number];

const OWNER_ONLY_TABS: TabValue[] = [
  "tickets",
  "validators",
  "soldList",
  "invitados",
  "paymentMethods",
  "acciones",
];

function resolveTab(tab: string | undefined, isEventOwner: boolean): TabValue {
  if (!tab || !(VALID_TABS as readonly string[]).includes(tab))
    return "overview";
  if (!isEventOwner && OWNER_ONLY_TABS.includes(tab as TabValue))
    return "overview";
  return tab as TabValue;
}

export default async function EventDetails({
  evento,
  tab,
}: {
  evento: EventoWithTicketsType;
  tab?: string;
}) {
  const session = await getSession();
  if (!session) return;

  if (evento.status === "DELETED") {
    redirect("/dashboard");
  }

  const isEventOwner = can(session.user, "events:edit");
  const activeTab = resolveTab(tab, isEventOwner);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-5xl">
          {evento.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra los datos de este evento
        </p>
      </div>

      <Navigation evento={evento} isEventOwner={isEventOwner} />

      <div className="flex md:grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-5 space-y-6 w-full">
          <EventTabsClient activeTab={activeTab} isEventOwner={isEventOwner}>
            <TabsContent value="overview" className="space-y-6">
              <DetailsTab
                isEventOwner={isEventOwner}
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
            <TabsContent value="invitados" className="space-y-6">
              <InvitadosTab
                evento={evento}
                showList={false}
                initialTickets={null}
                totalCount={0}
                eventId={evento.id}
              />
            </TabsContent>
            <TabsContent value="paymentMethods" className="space-y-6">
              <PaymentMethodsTab evento={evento} session={session} />
            </TabsContent>
            <TabsContent value="acciones" className="space-y-6">
              <AccionesTab evento={evento as unknown as Evento} />
            </TabsContent>
          </EventTabsClient>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <SideBar
            salesStats={<MinimalEventSalesStats eventId={evento.id} />}
          />
        </div>
      </div>
    </div>
  );
}
