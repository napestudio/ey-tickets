"use client";

import { FeaturedEventCarouselItem } from "@/types/superadmin";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

export default function FeaturedCarousel({
  events,
}: {
  events: FeaturedEventCarouselItem[];
}) {
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
        {events.map(({ id, event }) => {
          const image = event.featuredImage ?? event.image;
          const dateLabel = formatEventDate(event.startDate, event.eventEndDate);
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
  );
}
