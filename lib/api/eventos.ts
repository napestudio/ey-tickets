import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { buildEventAccessFilter, SessionUser } from "../permissions";

/**
 * Derives the event physical end date from the dates JSON string.
 * Returns the latest datetime found in the array.
 */
export function computeEventEndDate(datesJson: string): Date | null {
  try {
    const parsed: { id: number; date: string }[] = JSON.parse(datesJson);
    if (!parsed.length) return null;
    return new Date(Math.max(...parsed.map((d) => new Date(d.date).getTime())));
  } catch {
    return null;
  }
}

/**
 * Retorna los eventos accesibles para un usuario según su rol.
 * OWNER/ADMIN: todos los eventos de la productora.
 * MANAGER/SELLER: solo eventos donde son EventMember explícito.
 * SUPERADMIN: todos los eventos del sistema.
 */
export async function getAccessibleEvents(user: SessionUser) {
  const filter = buildEventAccessFilter(user);
  return prisma.event.findMany({
    where: {
      ...filter,
      status: { not: "DELETED" },
    },
    include: {
      producer: true,
      tickets: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventsByProducerId(producerId: string) {
  return prisma.event.findMany({
    where: {
      producerId,
      status: { not: "DELETED" },
    },
    include: {
      producer: true,
      tickets: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export const getActiveEventsByProducerId = cache(async (producerId: string) => {
  return prisma.event.findMany({
    where: {
      producerId,
      status: { equals: "ACTIVE" },
      saleEndDate: { not: { lte: new Date() } },
    },
    include: { producer: true },
  });
});

export const getActiveEventsByProducerSlug = cache(async (slug: string) => {
  return prisma.event.findMany({
    where: {
      producer: { slug },
      status: { equals: "ACTIVE" },
      saleEndDate: { not: { lte: new Date() } },
    },
    include: { producer: true },
  });
});

export async function createEvent(data: Prisma.EventCreateInput) {
  return prisma.event.create({ data });
}

export async function updateEvent(
  eventId: string,
  eventData: Prisma.EventUpdateInput
) {
  return prisma.event.update({
    where: { id: eventId },
    data: eventData,
  });
}

export async function getEventTitleById(eventId: string): Promise<string | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { title: true },
  });
  return event?.title ?? null;
}

export const getSingleEvent = cache(async (eventId: string) => {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      producer: {
        select: {
          configuration: {
            select: { serviceCharge: true },
          },
        },
      },
      ticketTypes: {
        where: { status: { not: "DELETED" } },
      },
      eventPayments: {
        where: { paymentMethod: { type: "DIGITAL" } },
        include: {
          paymentMethod: {
            select: { type: true, apiKey: true },
          },
        },
      },
      discountCode: {
        where: { status: { not: "DELETED" } },
      },
      tickets: {
        select: {
          ticketType: {
            select: { title: true, id: true },
          },
        },
      },
      validatorToken: true,
    },
  });
});
export type GetSingleEventResponse = Prisma.PromiseReturnType<
  typeof getSingleEvent
>;

export const getSingleEventBySlug = cache(async (slug: string) => {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      producer: {
        select: {
          name: true,
          logo: true,
          email: true,
          configuration: {
            select: { serviceCharge: true },
          },
        },
      },
      ticketTypes: {
        where: { status: { not: "DELETED" } },
        select: {
          id: true,
          title: true,
          price: true,
          discount: true,
          limitPerSale: true,
          buyGet: true,
          status: true,
          endDate: true,
          dates: true,
          quantity: true,
          isFree: true,
        },
      },
      eventPayments: {
        where: { paymentMethod: { type: "DIGITAL" } },
        include: {
          paymentMethod: {
            select: { type: true },
          },
        },
      },
      discountCode: {
        where: { status: { not: "DELETED" } },
        select: { id: true },
      },
    },
  });
});

export type GetSingleEventBySlugResponse = Prisma.PromiseReturnType<
  typeof getSingleEventBySlug
>;

export const getEventById = cache(async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      producer: true,
      ticketTypes: {
        where: { status: { not: "DELETED" } },
      },
      eventPayments: {
        include: { paymentMethod: true },
      },
      discountCode: {
        where: { status: { not: "DELETED" } },
      },
      validatorToken: true,
    },
  });

  if (!event) return null;

  return {
    ...event,
    ticketTypes: event.ticketTypes.map((tt) => ({
      ...tt,
      price: tt.price.toNumber(),
      discount: tt.discount?.toNumber() ?? null,
    })),
  };
});

/**
 * Lightweight query for the dashboard event overview page.
 * Only fetches the fields needed to render the header and action grid.
 */
export const getEventForOverview = cache(async (eventId: string) => {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      address: true,
      state: true,
      city: true,
      producerId: true,
      image: true,
      dates: true,
      status: true,
      eventType: true,
      venue: true,
      startDate: true,
      saleEndDate: true,
      eventEndDate: true,
      createdAt: true,
    },
  });
});

export async function getStats({
  ticketTypeId,
  eventId,
}: {
  ticketTypeId?: string;
  eventId?: string;
}) {
  if (!ticketTypeId && !eventId) {
    throw new Error("No ticketTypeId or eventId");
  }

  const where = {
    status: "PAID" as const,
    ...(ticketTypeId ? { ticketTypeId } : { eventId }),
  };

  const aggregate = await prisma.order.aggregate({
    _sum: { quantity: true, totalPrice: true },
    _max: { createdAt: true },
    where,
  });

  return {
    totalSold: aggregate._sum.quantity ?? 0,
    totalRevenue: aggregate._sum.totalPrice?.toNumber() ?? 0,
    lastSale: aggregate._max.createdAt ?? null,
  };
}

/**
 * Eventos accesibles para un SELLER/MANAGER via EventMember.
 */
/**
 * Todos los eventos activos (para páginas públicas).
 */
export async function getAllActiveEvents() {
  return prisma.event.findMany({
    where: {
      status: "ACTIVE",
      eventType: "PUBLIC",
      saleEndDate: { not: { lte: new Date() } },
    },
    include: { producer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventsByMemberId(userId: string) {
  return prisma.event.findMany({
    where: {
      status: { not: "DELETED" },
      members: { some: { userId } },
    },
    include: {
      ticketTypes: true,
      orders: true,
      producer: true,
    },
  });
}
