import { cache } from "react";
import { Evento } from "../actions";
import {prisma} from "../prisma";
import { CLIENT_ID } from "../constants";
import { id } from "date-fns/locale";
import { equal } from "assert";
import { Prisma } from "@prisma/client";

export const getEventsByUserId = cache(async (userId: string) => {
  return prisma.event.findMany({
    where: {
      userId: userId,
      status: {
        not: "DELETED",
      },
    },
    include: {
      user: true,
      discountCode: true,
      tickets: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const getAllEvents = cache(async () => {
  return prisma.event.findMany({
    where: {
      status: {
        not: "DELETED",
      },
      endDate: {
        not: {
          lte: new Date(),
        },
      },
    },
    include: {
      user: true,
    },
  });
});

export async function getAllEventByClientId() {
  return prisma.event.findMany({
    where: {
      user: {
        clientId: {
          equals: CLIENT_ID,
        },
      },
    },
    include: {
      user: true,
    },
  });
}
export async function getAllActiveEventByClientId() {
  return prisma.event.findMany({
    where: {
      status: {
        equals: "ACTIVE",
      },
      user: {
        clientId: {
          equals: CLIENT_ID,
        },
      },
      endDate: {
        not: {
          lte: new Date(),
        },
      },
    },
    include: {
      user: true,
    },
  });
}

// Get eventos home por Client ID
export const getAllActiveEvents = async () => {
  return prisma.event.findMany({
    where: {
      status: {
        equals: "ACTIVE",
      },
      user: {
        clientId: {
          equals: CLIENT_ID,
        },
      },
      endDate: {
        not: {
          lte: new Date(),
        },
      },
    },
    include: {
      user: true,
    },
  });
};

export async function createEvent(data: Evento) {
  return prisma.event.create({ data });
}

export async function updateEvent(eventId: string, eventData: Partial<Evento>) {
  return prisma.event.update({
    where: {
      id: eventId,
    },
    data: eventData,
  });
}

export const getSingleEvent = cache(async (eventId: string) => {
  return prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      user: {
        select: {
          configuration: {
            select: {
              serviceCharge: true,
            },
          },
        },
      },
      ticketTypes: {
        where: {
          status: {
            not: "DELETED",
          },
        },
      },
      eventPayments: {
        where: {
          paymentMethod: {
            type: "DIGITAL",
          },
        },
        include: {
          paymentMethod: {
            select: {
              type: true,
              apiKey: true,
            },
          },
        },
      },
      discountCode: {
        where: {
          status: {
            not: "DELETED",
          },
        },
      },
      tickets: {
        select: {
          ticketType: {
            select: {
              title: true,
              id: true,
            },
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

export const getEventById = cache(async (eventId: string) => {
  return prisma.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      user: true,
      ticketTypes: {
        where: {
          status: {
            not: "DELETED",
          },
        },
      },
      eventPayments: {
        include: {
          paymentMethod: true,
        },
      },
      discountCode: {
        where: {
          status: {
            not: "DELETED",
          },
        },
      },
      tickets: {
        select: {
          name: true,
          lastName: true,
          dni: true,
          id: true,
          date: true,
          code: true,
          isInvitation: true,
          email: true,
          createdAt: true,
          ticketType: {
            select: {
              title: true,
              dates: true,
            },
          },
          order: {
            select: {
              event: {
                select: {
                  title: true,
                  location: true,
                  address: true,
                },
              },
              ticketType: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
      validatorToken: true,
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
    _sum: {
      quantity: true,
      totalPrice: true,
    },
    _max: {
      createdAt: true,
    },

    where,
  });

  return {
    totalSold: aggregate._sum.quantity ?? 0,
    totalRevenue: aggregate._sum.totalPrice ?? 0,
    lastSale: aggregate._max.createdAt ?? null,
  };
}

export async function getEventsBySellerId(userId: string) {
  const events = await prisma.event.findMany({
    where: {
      eventPayments: {
        some: {
          paymentMethod: {
            type: "CASH",
            userId: userId,
          },
        },
      },
    },
    include: {
      ticketTypes: true,
      orders: true,
      user: true,
    },
  });

  return events;
}
