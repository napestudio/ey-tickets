import { GetSingleEventResponse } from "@/lib/api/eventos";
import { Evento } from "@/types/event";
import { CalendarIcon, MapPin } from "lucide-react";
import Image from "next/image";

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
  const truncateDescription = (description: string, maxLength: number) => {
    const plain = description.replace(/<[^>]*>/g, "");
    if (plain.length > maxLength) {
      return `${plain.slice(0, maxLength)}...`;
    }
    return plain;
  };
  if (!evento) return;
  return (
    <section className="w-full relative">
      <div className="absolute h-[30vh] w-full overflow-hidden ">
        {evento.image && (
          <Image
            src={evento?.image || ""}
            alt="text"
            fill
            style={{ objectFit: "cover" }}
            className="inset-0 w-full h-full z-0 blur-sm scale-105"
          />
        )}
      </div>
      <div className="w-200 max-w-[90vw] mx-auto p-6 md:py-12 md:px-10 z-10 relative translate-y-24">
        <div className="gap-6 flex flex-col mx-auto">
          <div className="flex flex-col items-start justify-between gap-4">
            {evento.image && (
              <div
                className={`relative aspect-video h-auto w-full overflow-hidden`}
              >
                <Image
                  src={evento?.image || ""}
                  alt={evento.title || ""}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4 flex-1">
              <div className="space-y-2 w-[20rem] md:w-auto">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
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
                      <span className="text-sm font-bold">
                        {evento.venue} -
                      </span>
                    )}
                    <span className="text-sm font-medium">
                      {evento?.address}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-base text-balance">
                <p>{truncateDescription(evento?.description || "", 250)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
