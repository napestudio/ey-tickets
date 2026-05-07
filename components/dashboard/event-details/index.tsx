import { Evento, EventoWithTicketsType } from "@/types/event";

import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { datesFormater } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

import DashboardHeader from "../dashboard-header";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getRemainingTicketsByUser,
  getSoldTicketsByType,
  getUsedInvitesByUser,
  getUserMaxInvites,
} from "@/lib/actions";
import TicketsTab from "./tickets-tab";
import ValidatorsTab from "./validators-tab";
import DetailsTab from "./details-tab";
import Navigation from "./navigation";
import SideBar from "./side-bar";
import SoldTicketsTab from "./sold-tickets-tab";
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

  const isEventOwner =
    session.user.id === evento.userId ||
    session.user.type === "ADMIN" ||
    session.user.type === "SUPERADMIN";
  const isSeller = session.user.type === "SELLER";

  const maxInvitesAmount = await getUserMaxInvites(evento.userId);
  const usedInvites = await getUsedInvitesByUser(evento.userId);
  const soldTickets: Record<
    string,
    {
      id?: string | undefined;
      title?: string | undefined;
      count?: number | undefined;
    }
  > = await getSoldTicketsByType(evento.tickets || []);
  const remaingingTickets = await getRemainingTicketsByUser(evento.userId);
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
              <div className="relative h-[180px] md:h-[300px] w-full">
                <Image
                  src={evento?.image || "/placeholder.svg"}
                  alt={evento.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
                <div className="absolute right-2 top-2 bg-black rounded-full text-white px-3 py-1">
                  {evento.status}
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{groupedDates}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{evento.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Creado por {evento.user?.name}</span>
                  </div>
                </div>
              </CardContent>
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
                </TabsList>
              </div>
              <TabsContent value="overview" className="space-y-6">
                <DetailsTab
                  isEventOwner={isEventOwner}
                  isSeller={isSeller}
                  evento={evento}
                  session={session}
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
              soldTickets={soldTickets}
            />
          </div>
        </div>
      </div>
    </>
  );
}
