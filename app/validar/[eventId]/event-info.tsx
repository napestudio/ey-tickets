"use client";
import ExportEventAsPDF from "@/components/data-pdf";
import QrScannerComponent from "@/components/qr-scanner";
import ValidatorsPageHeader from "@/components/validator-page-header/validator-page-header";
import {
  getOrdersByEvent,
  getOrderTicketsByEvent,
  getTicketOrdersByEventId,
} from "@/lib/actions";
import { DataTable } from "./data-table";
import { getColumns } from "./colums";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Order } from "@/types/order";

type EventInfoProps = {
  eventId: string;
  type?: "ESTADISTICAS" | "VALIDADOR";
  soldCount?: any;
};

export type TicketsCountType = {
  [key: string]: {
    title: string;
    count: number;
  };
};

type TicketOrderType = {
  id?: string;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  base64Qr: string;
  date: Date;
  orderId: string;
  eventId: string;
  ticketTypeId?: string;
  status: "NOT_VALIDATED" | "VALIDATED";
};
export default function EventInfo({
  eventId,
  type = "VALIDADOR",
  soldCount,
}: EventInfoProps) {
  const [eventTitle, setEventTitle] = useState<string>("");
  const [ticketsData, setTicketsData] = useState<Partial<Order>[]>([]);
  const [totalTitckets, setTotalTickets] = useState<number>();
  const [ticketsCount, setTicketsCount] = useState<TicketsCountType>({});

  const columns = getColumns(type);

  const getTotalTicketsAndGroupByType = (orders: Partial<Order[]>) => {
    const newTicketsCount: TicketsCountType = {};

    orders.forEach((order) => {
      const quantity = order!.quantity || 0;
      const buyGet = order!.ticketType?.buyGet || 0;
      const ticketTypeId = order!.ticketType?.id || "unknown";
      const ticketTypeTitle = order!.ticketType?.title || "Unknown Type";

      // Si buyGet es mayor a 0, multiplicamos la cantidad, sino solo sumamos la cantidad normal
      const ticketsSold = buyGet > 0 ? quantity * buyGet : quantity;

      // Si el tipo de ticket ya está en el objeto, sumamos el conteo, sino lo inicializamos
      if (newTicketsCount[ticketTypeId]) {
        newTicketsCount[ticketTypeId].count += ticketsSold;
      } else {
        newTicketsCount[ticketTypeId] = {
          title: ticketTypeTitle,
          count: ticketsSold,
        };
      }
    });

    setTicketsCount(newTicketsCount);
  };

  function getTotalTickets(orders: Partial<Order[]>) {
    if (!orders) return;
    const totalTickets = orders.reduce((total, order) => {
      const quantity = order!.quantity || 0;
      const buyGet = order!.ticketType?.buyGet || 0;

      // Si buyGet es mayor a 0, multiplicamos la cantidad, sino solo sumamos la cantidad normal
      const ticketsSold = buyGet > 0 ? quantity * buyGet : quantity;

      return total + ticketsSold;
    }, 0);

    return totalTickets;
  }

  const updateTicketsData = async () => {
    try {
      const rest = await getTicketOrdersByEventId(eventId);
      const res = await getOrdersByEvent(eventId);
      const tickets = res.flatMap((order) => order.tickets).filter(Boolean);
      setEventTitle(res[0].event.title);
      const total = getTotalTickets(res as Order[]);
      getTotalTicketsAndGroupByType(res as Order[]);
      setTotalTickets(total);
      setTicketsData(tickets as TicketOrderType[]);
    } catch (error) {
      console.error("errr", error);
    }
  };

  useEffect(() => {
    updateTicketsData();
  }, []);

  return (
    <>
      {ticketsData.length > 0 && (
        <div className="space-y-5 w-full pb-20 bg-white">
          <ValidatorsPageHeader
            eventTitle={eventTitle}
            ticketsData={ticketsData as Partial<TicketOrderType>[]}
            soldCount={totalTitckets}
            ticketsCount={ticketsCount}
          />
          <div>
            <div className="flex justify-between mb-5 gap-2 flex-wrap">
              <ExportEventAsPDF
                //  @ts-ignore
                eventTitle={eventTitle}
                ticketsData={ticketsData as Partial<TicketOrderType>[]}
                quantity={ticketsData.length}
                type={"ESTADISTICAS"}
              />
              {type === "VALIDADOR" && (
                <div>
                  <QrScannerComponent
                    eventId={ticketsData[0].eventId!}
                    updateData={updateTicketsData}
                  />
                </div>
              )}
            </div>

            <div className="w-full overflow-hidden">
              <DataTable
                columns={columns}
                data={ticketsData as Partial<TicketOrderType>[]}
                updateData={updateTicketsData}
              />
            </div>
          </div>
        </div>
      )}
      {ticketsData.length == 0 && (
        <Card className="p-6 text-center">
          Aún no hay información sobre el evento.
        </Card>
      )}
    </>
  );
}
