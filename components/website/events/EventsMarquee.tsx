import { Evento } from "@/types/event";

export default function EventsMarquee({ events }: { events: Evento[] }) {
  return (
    <div className="w-full overflow-hidden py-2 bg-ey-turquoise">
      <div className="w-full  flex gap-6 font-bold font-nebulica items-center justify-center">
        <div className="flex gap-6 animate-marquee">
          {events.map((event, index2) => (
            <div key={index2} className="flex gap-6">
              <div className="overflow-hidden">
                <div className="uppercase whitespace-nowrap">{event.title}</div>
              </div>
              <div>/</div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 animate-marquee2">
          {events.map((event, index) => (
            <div key={index} className="flex gap-6">
              <div className="overflow-hidden">
                <div className="uppercase whitespace-nowrap">{event.title}</div>
              </div>
              <div>/</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
