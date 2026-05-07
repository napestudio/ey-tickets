"use client";
import { Filter, Plus } from "lucide-react";
import { Button } from "../ui/button";
import Box from "./box";
import { Evento } from "@/types/event";
import EventCard from "@/components/dashboard/event-card";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";
import { Session } from "next-auth";

export default function EventsDisplay({
  eventos,
  session,
}: {
  eventos: Evento[];
  session: Session;
}) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const isSeller = session.user.type === "SELLER";

  const upcomingEvents = eventos.filter(
    (evento) => evento.status !== "CONCLUDED" && evento.status !== "CANCELED"
  );

  const pastEvents = eventos.filter(
    (evento) => evento.status === "CONCLUDED" || evento.status === "CANCELED"
  );

  return (
    <Box>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-medium">Eventos</h2>
          <p className="text-sm">Administra tus eventos</p>
        </div>
        <div className="flex space-x-2">
          {/* <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button> */}
          {!isSeller && (
            <Button size="sm">
              <Link
                href="/dashboard/nuevo-evento"
                className="flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Evento
              </Link>
            </Button>
          )}
        </div>
      </div>
      <Tabs
        defaultValue="upcoming"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mt-4">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="past">Pasados</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-cols-1 gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((evento) => (
                <EventCard evento={evento} key={evento.id} session={session} />
              ))
            ) : (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                No hay eventos próximos.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-cols-1 gap-4">
            {pastEvents.length > 0 ? (
              pastEvents.map((evento) => (
                <EventCard evento={evento} key={evento.id} session={session} />
              ))
            ) : (
              <p className="col-span-full text-center text-sm text-muted-foreground">
                No hay eventos pasados.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Box>
  );
}
