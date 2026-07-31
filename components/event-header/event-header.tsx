import { GetSingleEventResponse } from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import { CalendarIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { EventDescription } from "../dashboard/event-description";

type EventHeaderProps = {
  evento: GetSingleEventResponse;
  dates: string;
  width?: number;
  height?: number;
};
export default function EventHeader({
  evento,
  dates,
  width = 20,
  height = 20,
}: EventHeaderProps) {
  if (!evento) return;

  return (
    <section className="w-full relative">
      <div className="w-200 max-w-[90vw] mx-auto px-6 pb-6 md:pb-12 md:px-10 z-10 relative">
        <div className="gap-6 flex flex-col mx-auto">
          <div className="space-y-2 w-[20rem] md:w-auto">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-4xl text-ey-turquoise">
              {evento?.title}
            </h1>
            <div className="flex items-center gap-2 ">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{dates}</span>
            </div>
            <div className="flex items-center gap-2 ">
              <MapPin className="w-4 h-4 shrink-0 font-bold" />
              <div>
                {evento?.venue && (
                  <span className="text-sm font-bold">{evento.venue} -</span>
                )}
                <span className="text-sm font-medium">{evento?.address}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 items-start justify-between gap-4">
            {evento.image && (
              <div
                className={`relative md:col-span-2 h-full w-full flex flex-col gap-4`}
              >
                <div
                  className={`relative aspect-3/4 h-auto w-full overflow-hidden`}
                >
                  <Image
                    src={evento?.image || ""}
                    alt={evento.title || ""}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col md:col-span-3 space-y-4 flex-1">
              <div className="text-base text-balance">
                <EventDescription html={evento?.description || ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
