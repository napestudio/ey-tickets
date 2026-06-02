import { datesFormater } from "@/lib/utils";
import { Evento } from "@/types/event";
import { TicketIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function EventCard({ evento }: { evento: Evento }) {
  const groupedDates = datesFormater(evento.dates as string);

  return (
    <Link
      href={`eventos/${evento.slug}`}
      prefetch={true}
      className="overflow-hidden shadow-[-1px_-1px_0.5px_0px_rgba(255,255,255,0.15),1px_1px_0.5px_0px_rgba(255,255,255,0.15)] bg-[linear-gradient(175deg,#11111105,#99999924)]"
    >
      <div className="flex flex-col h-full">
        <div className="relative max-w-[95vw] h-55">
          {evento.image ? (
            <Image
              src={evento.image}
              alt={`Portada del evento ${evento.title}`}
              height={500}
              width={500}
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>
        <div className="p-4 flex flex-col gap-1 grow">
          <div className="flex gap-2 flex-wrap items-center">
            <p className="text-sm uppercase font-bold tracking-wide text-neutral-100 ">
              {evento.venue}
            </p>
            <p className="text-sm font-medium text-neutral-100">
              {groupedDates}
            </p>{" "}
          </div>

          <div className="text-2xl text-neutral-50 font-base-neue font-semibold">
            {evento.title}
          </div>

          <p className="text-xs uppercase font-bold tracking-wide text-neutral-100 ">
            {evento.city}, {evento.state}
          </p>
        </div>
        <div className="flex justify-end gap-2 p-4 mt-auto">
          <Button className="w-full">
            <TicketIcon className="mr-2" />
            Comprar entradas
          </Button>
        </div>
      </div>
    </Link>
  );
}
