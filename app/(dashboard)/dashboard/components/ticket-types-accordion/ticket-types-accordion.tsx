"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Evento } from "@/types/event";
import EditTycketTypeForm from "../edit-ticket-type-form/edit-ticket-type-form";
import { TicketType } from "@/types/tickets";
import TycketTypeForm from "../ticket-type-form/ticket-type-form";
import { useState } from "react";
import Box from "@/components/dashboard/box";
import { Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TicketTypeAccordion({
  evento,
  ticketTypes,
  remainingTickets,
}: {
  ticketTypes: TicketType[];
  evento: Evento;
  remainingTickets: number;
}) {
  return (
    <div className="w-full mx-auto text-left">
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-gray-50 p-5 rounded w-full">
          {ticketTypes.length > 0 ? (
            <Accordion collapsible type="single">
              {ticketTypes.map((ticket) => (
                <AccordionItem value={ticket.id as string} key={ticket.id}>
                  <AccordionTrigger>{ticket.title}</AccordionTrigger>
                  <AccordionContent>
                    <EditTycketTypeForm evento={evento} ticket={ticket} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <h1>No hay tickets creados</h1>
          )}
        </div>
        <div className="flex justify-between">
          <h2 className="mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            Nuevo tipo de ticket
          </h2>
          <Card className="flex items-center gap-1 px-4  leading-none">
            Disponibles<span className="font-bold">{remainingTickets}</span>{" "}
            <Ticket className="w-8 h-8" />
          </Card>
        </div>

        <div>
          <TycketTypeForm evento={evento} remainingTickets={remainingTickets} />
        </div>
      </div>
    </div>
  );
}
