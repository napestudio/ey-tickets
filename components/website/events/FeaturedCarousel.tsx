"use client";

import { FeaturedEventCarouselItem } from "@/types/superadmin";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatEventDate(startDate: Date | null, endDate: Date | null): string {
  if (!startDate) return "";
  const fmt = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return fmt.format(startDate);
  }
  return `${fmt.format(startDate)} – ${fmt.format(endDate)}`;
}

function CarouselArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onPrev}
        aria-label="Anterior"
        className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-ey-turquoise/5 hover:bg-ey-turquoise-dark transition-colors text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        aria-label="Siguiente"
        className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-ey-turquoise-dark transition-colors text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function CarouselDots({
  count,
  activeIndex,
  onDotClick,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Ir a slide ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === activeIndex
              ? "w-6 h-2 bg-ey-turquoise"
              : "w-2 h-2 bg-ey-turquoise-dark/30 hover:bg-ey-turquoise-dark/60"
          }`}
        />
      ))}
    </div>
  );
}

export default function FeaturedCarousel({
  events,
}: {
  events: FeaturedEventCarouselItem[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full mb-18">
      <div className="aspect-video md:aspect-6/2">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          loop
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.realIndex);
          }}
          className="w-full h-full rounded-xl overflow-hidden"
        >
          {events.map(({ id, event }) => {
            const image = event.featuredImage ?? event.image;
            const dateLabel = formatEventDate(
              event.startDate,
              event.eventEndDate,
            );
            return (
              <SwiperSlide key={id} className="relative">
                <Link
                  href={`eventos/${event.slug}`}
                  className="block w-full h-full"
                >
                  {image && (
                    <Image
                      src={image}
                      alt={`Portada del evento ${event.title}`}
                      width={2200}
                      height={1200}
                      className="object-cover object-top h-full w-full"
                    />
                  )}
                  <div className="absolute h-full w-full inset-0 bg-linear-to-t to-50% from-black/80 to-transparent p-6">
                    <div className="flex flex-col justify-end h-full">
                      {dateLabel && (
                        <p className="text-sm text-white mb-1">{dateLabel}</p>
                      )}
                      <h2 className="text-3xl font-bold text-white">
                        {event.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="flex items-center justify-between mt-4 px-1">
        <CarouselArrows
          onPrev={() => swiperRef.current?.slidePrev()}
          onNext={() => swiperRef.current?.slideNext()}
        />
        <CarouselDots
          count={events.length}
          activeIndex={activeIndex}
          onDotClick={(i) => swiperRef.current?.slideToLoop(i)}
        />
      </div>
    </div>
  );
}
