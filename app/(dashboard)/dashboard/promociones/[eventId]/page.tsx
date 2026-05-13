import { getEventById } from "@/lib/actions";
import EditEventForm from "../../../../components/dashboard/edit-event-form";
import { Evento } from "@/types/event";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function Promotions({
  params,
}: {
  params: { eventId: string };
}) {
  const evento = await getEventById(params.eventId);
  return (
    <>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Promociones
      </h1>
      <p>{params.eventId}</p>
    </>
  );
}
