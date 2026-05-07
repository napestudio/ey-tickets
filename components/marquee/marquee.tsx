"use client";
import { Reeller, ScrollerPlugin } from "reeller";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { HomeCard } from "@/types/card";
import { datesFormater } from "@/lib/utils";
import { Dot, Rocket } from "lucide-react";
import Link from "next/link";

Reeller.registerGSAP(gsap);
Reeller.use(ScrollerPlugin);

export default function EventMarquee({ eventos }: { eventos: HomeCard[] }) {
  const reelRef = useRef<HTMLDivElement>(null);
  const reellerRef = useRef<Reeller | null>(null);

  useEffect(() => {
    if (reelRef.current) {
      reellerRef.current = new Reeller({
        container: ".my-reel",
        wrapper: ".my-reel-wrap",
        itemSelector: ".my-reel-item",
        speed: 50,
        paused: false,
        autoStop: true,
        plugins: {
          scroller: {
            speed: 5,
            multiplier: 0.5,
            threshold: 1,
          },
        },
      });

      return () => {
        reellerRef.current?.destroy();
      };
    }
  }, [reelRef]);

  if (eventos.length < 2) return;
  return (
    <div className="my-reel py-2" ref={reelRef}>
      <div className="my-reel-wrap flex gap-5">
        {eventos.map((evento) => (
          <div className="my-reel-item whitespace-nowrap" key={evento.id}>
            <div className="text-5xl gradient-marquee hover:text-white transition-colors text-stroke uppercase">
              <Link
                href={`eventos/${evento.id}`}
                className="flex gap-2 items-end hover:text-white "
              >
                <span className="font-black tracking-widest">
                  {evento.title}
                </span>
                <span className="font-bold text-xl tracking-widest">
                  {datesFormater(evento.dates as string)}
                </span>{" "}
                <span className="ml-2 font-black">/</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
