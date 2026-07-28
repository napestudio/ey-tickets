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
      className="overflow-hidden rounded-xl bg-neutral-950 shadow-[-1px_-1px_0.5px_0px_rgba(255,255,255,0.15),1px_1px_0.5px_0px_rgba(255,255,255,0.15)] bg-[linear-gradient(175deg,#11111105,#99999924)] group"
    >
      <div className="flex h-full ">
        <div className="relative max-w-[95vw] aspect-square h-55 overflow-hidden">
          {evento.image ? (
            <Image
              src={evento.image}
              alt={`Portada del evento ${evento.title}`}
              height={500}
              width={500}
              className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-neutral-100" />
          )}
        </div>
        <div className="p-4 flex flex-col gap-1 grow">
          <div className="flex gap-2 flex-col">
            <p className="text-xs uppercase tracking-wide text-neutral-100 ">
              {evento.city}, {evento.state}
            </p>
            <p className="text-xs uppercase font-bold tracking-wide text-neutral-100 ">
              {evento.venue}
            </p>
          </div>

          <div className="text-2xl text-neutral-50 font-semibold">
            {evento.title}
          </div>
          <p className="text-sm font-medium text-neutral-100">{groupedDates}</p>

          <div className="flex gap-2 mt-auto">
            <div className="bg-ey-turquoise flex font-bold items-center px-6 py-3 w-max rounded-md shadow-md">
              <TicketIcon className="mr-2" />
              Comprar entradas
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
