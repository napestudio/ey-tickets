"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsometricLayoutEffect";
import { datesFormater } from "@/lib/utils";

type EventMarqueeItem = {
  title: string;
  dates?: string | null;
  city?: string | null;
  state?: string | null;
};

const SPEED = 80; // px/s

export default function EventsMarquee({ events }: { events: EventMarqueeItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const set2Ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!trackRef.current || !set2Ref.current || !events.length) return;

    const ctx = gsap.context(() => {
      // offsetLeft of the second set equals the width of the first set + the gap,
      // which is exactly the distance to travel before the loop resets seamlessly.
      const dist = set2Ref.current!.offsetLeft;

      gsap.to(trackRef.current, {
        x: -dist,
        duration: dist / SPEED,
        ease: "none",
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [events]);

  const items = events.map((event, i) => {
    const dates = datesFormater(event.dates as string);
    const location = [event.city, event.state].filter(Boolean).join(", ");

    return (
      <div key={i} className="flex items-center gap-3 shrink-0">
        <span className="uppercase whitespace-nowrap font-bold">{event.title}</span>
        {dates && (
          <>
            <span className="opacity-60">·</span>
            <span className="whitespace-nowrap font-normal">{dates}</span>
          </>
        )}
        {location && (
          <>
            <span className="opacity-60">·</span>
            <span className="whitespace-nowrap font-normal">{location}</span>
          </>
        )}
        <span className="opacity-60">/</span>
      </div>
    );
  });

  return (
    <div ref={containerRef} className="w-full overflow-hidden py-2 bg-ey-turquoise">
      <div
        ref={trackRef}
        className="flex gap-6 font-nebulica items-center will-change-transform"
      >
        {/* First set */}
        <div className="flex gap-6 items-center shrink-0">{items}</div>

        {/* Second set — identical copy for seamless loop */}
        <div ref={set2Ref} aria-hidden className="flex gap-6 items-center shrink-0">
          {items}
        </div>
      </div>
    </div>
  );
}
