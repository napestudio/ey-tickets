import { HomeCard } from "@/types/card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { TicketIcon } from "lucide-react";
import Image from "next/image";
import { datesFormater } from "@/lib/utils";

export default function EventCard({ evento }: { evento: HomeCard }) {
  const groupedDates = datesFormater(evento.dates as string);

  return (
    <Link
      href={`eventos/${evento.id}`}
      prefetch={true}
      className="overflow-hidden border-4 rounded-sm border-black shadow-hard bg-white"
    >
      <Card className="border-none rounded-none flex flex-col h-full">
        <div className="relative border-b-4 border-black max-w-[95vw] h-[300px]">
          <Image
            src={evento.image || ""}
            alt={`Portada del evento ${evento.title}`}
            height={500}
            width={500}
            className="object-cover h-full w-full"
          />
        </div>
        <CardContent className="p-4 flex flex-col gap-1 flex-grow">
          <div className="flex gap-2 flex-wrap items-center">
            <p className="text-sm font-medium text-gray-500">{groupedDates}</p>{" "}
            |
            <p className="text-sm uppercase font-bold tracking-wide text-gray-500 dark:text-gray-400">
              {evento.location}
            </p>
          </div>

          <CardTitle className="text-2xl">{evento.title}</CardTitle>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4 mt-auto">
          <Button className="w-full bg-red hover:bg-red-light hover:bg-opacity-10 hover:shadow-none transition-all rounded-none py-8 text-2xl border-4 border-black shadow-hard">
            <TicketIcon className="mr-2" />
            Comprar entradas
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
