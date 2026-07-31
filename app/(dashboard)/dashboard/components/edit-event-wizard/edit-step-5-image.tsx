"use client";

import EventImagesManager from "@/components/dashboard/event-details/event-images-manager";

interface Props {
  eventId: string;
  eventTitle: string;
  eventImage: string | null;
  eventImagePublicId: string | null;
  thumbnailImage: string | null;
  thumbnailImagePublicId: string | null;
}

export function EditStep5Image(props: Props) {
  return <EventImagesManager {...props} />;
}
