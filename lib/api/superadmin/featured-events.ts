import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateFeaturedEventInput,
  FeaturedEventCarouselItem,
  FeaturedEventDetail,
  UpdateFeaturedEventInput,
} from "@/types/superadmin";

type FeaturedEventRaw = Prisma.FeaturedEventGetPayload<{
  select: {
    id: true;
    position: true;
    startDate: true;
    endDate: true;
    status: true;
    price: true;
    notes: true;
    createdAt: true;
    updatedAt: true;
    event: {
      select: {
        id: true;
        title: true;
        slug: true;
        image: true;
        featuredImage: true;
        startDate: true;
        eventEndDate: true;
        producer: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

const featuredEventSelect = {
  id: true,
  position: true,
  startDate: true,
  endDate: true,
  status: true,
  price: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  event: {
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      featuredImage: true,
      startDate: true,
      eventEndDate: true,
      producer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.FeaturedEventSelect;

function mapFeaturedEvent(raw: FeaturedEventRaw): FeaturedEventDetail {
  return {
    ...raw,
    price: raw.price.toNumber(),
  };
}

export async function getActiveFeaturedEventsForCarousel(): Promise<FeaturedEventCarouselItem[]> {
  const now = new Date();
  return prisma.featuredEvent.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: {
      id: true,
      position: true,
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          featuredImage: true,
          startDate: true,
          eventEndDate: true,
        },
      },
    },
    orderBy: { position: "asc" },
  });
}

export async function getFeaturedEvents(): Promise<FeaturedEventDetail[]> {
  const events = await prisma.featuredEvent.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: featuredEventSelect,
  });
  return events.map(mapFeaturedEvent);
}

export async function createFeaturedEvent(
  data: CreateFeaturedEventInput
): Promise<FeaturedEventDetail> {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw Object.assign(new Error("Fechas inválidas"), { status: 400 });
  }

  if (end <= start) {
    throw Object.assign(
      new Error("La fecha de fin debe ser posterior a la de inicio"),
      { status: 400 }
    );
  }

  const featured = await prisma.featuredEvent.create({
    data: {
      eventId: data.eventId,
      position: data.position,
      startDate: start,
      endDate: end,
      price: new Prisma.Decimal(data.price),
      notes: data.notes ?? null,
    },
    select: featuredEventSelect,
  });

  return mapFeaturedEvent(featured);
}

export async function updateFeaturedEvent(
  id: string,
  data: UpdateFeaturedEventInput
): Promise<FeaturedEventDetail | null> {
  const existing = await prisma.featuredEvent.findUnique({ where: { id } });
  if (!existing) return null;

  const updateData: Prisma.FeaturedEventUpdateInput = {};

  if (data.position !== undefined) updateData.position = data.position;
  if (data.price !== undefined)
    updateData.price = new Prisma.Decimal(data.price);
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.startDate !== undefined) {
    const d = new Date(data.startDate);
    if (isNaN(d.getTime()))
      throw Object.assign(new Error("startDate inválida"), { status: 400 });
    updateData.startDate = d;
  }

  if (data.endDate !== undefined) {
    const d = new Date(data.endDate);
    if (isNaN(d.getTime()))
      throw Object.assign(new Error("endDate inválida"), { status: 400 });
    updateData.endDate = d;
  }

  const updated = await prisma.featuredEvent.update({
    where: { id },
    data: updateData,
    select: featuredEventSelect,
  });

  return mapFeaturedEvent(updated);
}
