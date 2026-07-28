"use client";

import { Evento } from "@/types/event";
import { datesFormater } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FeaturedCarousel({ events }: { events: Evento[] }) {
  return (
    <div className="w-full aspect-6/2 mb-18">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop
        className="w-full h-full rounded-xl overflow-hidden"
      >
        {events.map((evento) => {
          const groupedDates = datesFormater(evento.dates as string);
          return (
            <SwiperSlide key={evento.id} className="relative">
              <Link
                href={`eventos/${evento.slug}`}
                className="block w-full h-full"
              >
                {evento.image && (
                  <Image
                    src={evento.image}
                    alt={`Portada del evento ${evento.title}`}
                    width={2200}
                    height={1200}
                    className="object-cover object-top h-full w-full"
                  />
                )}
                <div className="absolute h-full w-full inset-0 bg-linear-to-t to-50% from-black/80 to-transparent p-6">
                  <div className="flex flex-col justify-end h-full">
                    <p className="text-sm text-white mb-1">{groupedDates}</p>
                    <h2 className="text-3xl font-bold text-white">
                      {evento.title}
                    </h2>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
