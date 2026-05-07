"use client";

import TicketTypeAccordion from "@/app/dashboard/components/ticket-types-accordion/ticket-types-accordion";
import EditEventForm from "@/components/dashboard/edit-event-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Evento } from "@/types/event";
import { TicketType } from "@/types/tickets";
import { useEffect, useState } from "react";

interface EditEventTabsProps {
  evento: Evento;
  tab?: string;
  remainingTickets: number;
}

export default function EditEventTabs({
  evento,
  tab,
  remainingTickets,
}: EditEventTabsProps) {
  const [activeTab, setActiveTab] = useState(tab || "basic");

  return (
    <Tabs
      defaultValue={activeTab}
      className="w-full"
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Información</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        {/* <TabsTrigger value="settings">Configuración</TabsTrigger> */}
      </TabsList>
      <TabsContent value="basic" className="space-y-6">
        <EditEventForm evento={evento} />
      </TabsContent>
      <TabsContent value="tickets" className="space-y-6">
        <TicketTypeAccordion
          ticketTypes={evento.ticketTypes as TicketType[]}
          evento={evento as Evento}
          remainingTickets={remainingTickets}
        />
      </TabsContent>
    </Tabs>
  );
}
