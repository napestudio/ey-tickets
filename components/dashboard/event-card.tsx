"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MapPin, TicketIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Evento } from "@/types/event";

import { cn, datesFormater } from "@/lib/utils";
import { Session } from "next-auth";

export default function EventCard({
  evento,
  session,
}: {
  evento: Evento;
  session: Session;
}) {
  const groupedDates = datesFormater(evento.dates as string);
  const isEventOwner =
    session.user.id === evento.userId ||
    session.user.type === "ADMIN" ||
    session.user.type === "SUPERADMIN";
  const isSeller = session.user.type === "SELLER";

  const isInactive =
    evento.status === "CANCELED" || evento.status === "CONCLUDED";

  return (
    <>
      <Card className={cn("w-full text-left overflow-hidden")} key={evento.id}>
        <CardHeader
          className={cn("flex gap-2 p-0", isInactive && "opacity-50")}
        >
          <div className="relative h-48 w-full ">
            <Image
              src={evento.image || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover"
            />
            {evento.status === "CANCELED" && (
              <div className="absolute left-2 top-2 bg-red-500 rounded-full text-white px-3 py-1">
                Cancelado
              </div>
            )}
            <div className="absolute right-2 top-2 bg-black rounded-full text-white px-3 py-1">
              {evento.user!.name}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-1">
            <div>
              <CardTitle className="text-lg mb-4">{evento.title}</CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2 mb-2">
                  <MapPin className="mr-1 h-4 w-4" />
                  {evento.location}
                </span>
                <span className="flex items-center gap-2 mb-4">
                  <Calendar className="mr-1 h-4 w-4" />
                  {groupedDates}
                </span>
                {/* <span className="space-y-2">
                  <span className="flex justify-between text-sm font-bold">
                    <span>Tickets vendidos</span>
                    <span>100 / 1200</span>
                  </span>
                </span> */}
              </CardDescription>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 p-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/evento/${evento.id}`} prefetch={true}>
              Detalles
            </Link>
          </Button>
          {!isInactive && !isSeller && isEventOwner && (
            <Button>
              <Link
                href={`/dashboard/evento/${evento.id}/edit?tab=tickets`}
                className="flex items-center gap-2"
              >
                <TicketIcon className="w-6 h-6" /> Tickets
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
