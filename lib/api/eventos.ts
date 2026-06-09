import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { buildEventAccessFilter, SessionUser } from "../permissions";

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
      endDate: { not: { lte: new Date() } },
    },
    include: { producer: true },
  });
});

export const getActiveEventsByProducerSlug = cache(async (slug: string) => {
  return prisma.event.findMany({
    where: {
      producer: { slug },
      status: { equals: "ACTIVE" },
      endDate: { not: { lte: new Date() } },
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
export const getAllActiveEvents = cache(async () => {
  return prisma.event.findMany({
    where: {
      status: "ACTIVE",
      endDate: { not: { lte: new Date() } },
    },
    include: { producer: true },
    orderBy: { createdAt: "desc" },
  });
});

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
