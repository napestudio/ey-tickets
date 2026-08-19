"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducerStockStore } from "@/store/producer-stock-store";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import useIsomorphicLayoutEffect from "@/hooks/useIsometricLayoutEffect";

const FLASH_RED = "#f87171";
const FLASH_GREEN = "#4ade80";
const TRANSLATE_Y = 45;

export function ProducerStockWidget() {
  const { summary, isLoading } = useProducerStockStore();
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  const available = summary?.available ?? null;
  const prevAvailable = useRef<number | null>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const valueCloneRef = useRef<HTMLParagraphElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (available === null) return;

    const prev = prevAvailable.current;
    prevAvailable.current = available;

    if (prev === null || prev === available) {
      setDisplayValue(available);
      return;
    }

    const el = valueCloneRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;
    setDisplayValue(available);
    const negativeTl = gsap
      .timeline({ paused: true })
      .to(el, {
        y: -TRANSLATE_Y,
        // opacity: 0,
        duration: 2,
      })
      .to(el, { scale: 0.5, opacity: 0, duration: 1 }, "-=1.5");

    const positiveTl = gsap
      .timeline({ paused: true })
      .to(el, {
        y: 0,
        scale: 1,
        duration: 2,
      })
      .to(el, { scale: 0.5, opacity: 0, duration: 1 }, "-=1.5");

    const isDecrease = available < prev;
    if (isDecrease) {
      gsap.set(el, { y: 0, opacity: 1, scale: 1, color: FLASH_RED });
      negativeTl.play();
    } else {
      gsap.set(el, {
        y: -TRANSLATE_Y,
        opacity: 1,
        scale: 1.5,
        color: FLASH_GREEN,
      });
      positiveTl.play();
    }
  }, [available]);

  if (isLoading && summary === null) {
    return (
      <div className="mx-4 rounded-lg bg-neutral-800 px-4 py-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-neutral-700 mb-2" />
        <div className="h-6 w-12 rounded bg-neutral-700" />
      </div>
    );
  }

  if (summary === null) return null;

  const valueColor =
    available === 0
      ? "text-red-400"
      : available! <= 29
        ? "text-red-300"
        : "text-ey-turquoise-dark";

  return (
    <Link
      href="/dashboard/ticket-stock"
      className="mx-4 rounded-lg bg-neutral-800 px-4 py-3 flex items-start gap-3 hover:bg-neutral-700 transition-colors"
    >
      <Ticket className={cn("h-5 w-5 shrink-0", valueColor)} />
      <div className="min-w-0">
        <div ref={wrapperRef} className="relative leading-none">
          <p
            ref={valueRef}
            className={cn("text-xl font-semibold leading-none", valueColor)}
          >
            {displayValue !== null
              ? displayValue.toLocaleString("es-AR")
              : (available ?? 0).toLocaleString("es-AR")}
          </p>
          <p
            ref={valueCloneRef}
            className={cn(
              "text-xl font-semibold leading-none absolute top-0 text-white/0",
            )}
          >
            {displayValue !== null
              ? displayValue.toLocaleString("es-AR")
              : (available ?? 0).toLocaleString("es-AR")}
          </p>
        </div>
        <p className="text-xs text-neutral-400 leading-none mt-1">
          Disponibles
        </p>
      </div>
    </Link>
  );
}
